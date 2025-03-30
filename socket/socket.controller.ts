import { Socket } from 'socket.io';
import { OrderDetail } from '../model';

const validateDeskId = (desk_id: string, callback: Function): boolean => {
    if (!desk_id) {
        callback({ message: 'Desk ID is required' }, null);
        return false;
    }
    return true;
};

const handleExistingOrder = async (getOrderDetail: any[], product_id: string, quantity: number, desk_id: string, socket: Socket, callback: Function) => {
    const existingOrder = getOrderDetail.find((order: any) => order.product_id === product_id);
    if (existingOrder) {
        existingOrder.quantity += quantity;
        await OrderDetail.update(existingOrder, existingOrder.id);
        socket.to(desk_id).emit('order:updated', existingOrder);
        callback(null, existingOrder);
        return true;
    }
    return false;
};

const SocketController = (socket: Socket) => {
    console.log('New connection', socket.id);

    socket.on('join:desk', (desk_id) => {
        socket.join(desk_id);
        socket.emit('joined:desk', desk_id);
    });

    socket.on('order:create', async (data, callback) => {
        const { product_id, quantity, desk_id } = data;
        try {
            const getOrderDetail = await OrderDetail.getAll(desk_id);
            if (getOrderDetail) {
                const handled = await handleExistingOrder(getOrderDetail, product_id, quantity, desk_id, socket, callback);
                if (handled) return;
            }
            const orderDetail = new OrderDetail(product_id, quantity, desk_id);
            await OrderDetail.save(orderDetail);

            socket.to(desk_id).emit('order:created', orderDetail);
            callback(null, orderDetail);
        } catch (error) {
            callback(error);
        }
    });

    socket.on('order:get', async (data, callback) => {
        const { desk_id } = data;
        if (!validateDeskId(desk_id, callback)) return;

        try {
            const orderDetails = await OrderDetail.getAll(desk_id);
            if (!orderDetails) {
                callback({ message: 'No orders found for the specified desk' }, null);
                return;
            }

            socket.to(desk_id).emit('order:details', orderDetails);
            callback(null, orderDetails);
        } catch (error: any) {
            callback({ message: error.message }, null);
        }
    });

    socket.on('order:update', async (data, callback) => {
        const { order_detail_id, desk_id, update_quantity } = data;
        if (!validateDeskId(desk_id, callback)) return;

        try {
            const orderDetail = await OrderDetail.get(order_detail_id);
            if (!orderDetail) {
                callback({ message: 'OrderDetail not found' }, null);
                return;
            }
            orderDetail.quantity = update_quantity;
            await OrderDetail.update(orderDetail, orderDetail.id);
            socket.to(desk_id).emit('order:detail:updated', orderDetail);
            callback(null, orderDetail);
        } catch (error: any) {
            callback({ message: error.message }, null);
        }
    });

    socket.on('order:delete', async (data, callback) => {
        const { order_detail_id, desk_id } = data;
        if (!validateDeskId(desk_id, callback)) return;

        try {
            const orderDetail = await OrderDetail.get(order_detail_id);
            if (!orderDetail) {
                callback({ message: 'OrderDetail not found' }, null);
                return;
            }

            await OrderDetail.delete(order_detail_id);
            socket.to(desk_id).emit('order:deleted', order_detail_id);
            callback(null, order_detail_id);
        } catch (error: any) {
            callback({ message: error.message }, null);
        }
    });

    socket.on('order:delete:all', async (data, callback) => {
        const { desk_id } = data;
        if (!validateDeskId(desk_id, callback)) return;

        try {
            const rowsDeleted = await OrderDetail.deleteAll(desk_id);
            if (rowsDeleted > 0) {
                socket.to(desk_id).emit('order:deleted:all', desk_id);
                callback(null, { desk_id, rowsDeleted });
            } else {
                callback({ message: 'No orders found to delete for the specified desk' }, null);
            }
        } catch (error: any) {
            callback({ message: error.message }, null);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    });
};

export { SocketController };
