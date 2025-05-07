import { Socket } from 'socket.io';
import { OrderDetail } from '../model';
import { handleExistingOrder, validateDeskId } from '../helpers';

const SocketController = (socket: Socket) => {
    console.log('New connection', socket.id);

    socket.on('join:desk', (desk_id) => {
        socket.join(desk_id);
        socket.emit('joined:desk', desk_id);
    });

    socket.on('join:kitchen', () => {
        socket.join('kitchen');
    });

    socket.on('order:create', async (data, callback) => {
        const { product_id, quantity, desk_id, garrison } = data;

        try {
            const getOrderDetail = await OrderDetail.getAll(desk_id);
            if (getOrderDetail) {
                const handled = await handleExistingOrder(getOrderDetail, product_id, quantity, desk_id, garrison, socket, callback);
                if (handled) return;
            }

            const orderDetail = new OrderDetail(product_id, quantity, desk_id, garrison);
            await OrderDetail.save(orderDetail);

            const updatedOrderDetails = await OrderDetail.getAll(desk_id);
            socket.to(desk_id).emit('order:details', updatedOrderDetails);

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

            callback(null, orderDetails);
        } catch (error: any) {
            callback({ message: error.message }, null);
        }
    });

    socket.on('order:update', async (data, callback) => {
        const { order_detail_id, desk_id, update_quantity, garrison } = data;
        if (!validateDeskId(desk_id, callback)) return;

        try {
            const orderDetail = await OrderDetail.get(order_detail_id);
            if (!orderDetail) {
                callback({ message: 'OrderDetail not found' }, null);
                return;
            }

            orderDetail.quantity = update_quantity;
            orderDetail.garrison = garrison ? JSON.stringify(garrison) : null;
            await OrderDetail.update(orderDetail, orderDetail.id);

            const updatedOrderDetails = await OrderDetail.getAll(desk_id);
            socket.to(desk_id).emit('order:details', updatedOrderDetails);

            callback(null, { ...orderDetail, garrison: garrison });
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

            const updatedOrderDetails = await OrderDetail.getAll(desk_id);
            socket.to(desk_id).emit('order:details', updatedOrderDetails);

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

    socket.on('order:sendToKitchen', async (data, callback) => {
        const { desk_id, orderDetails } = data;
        if (!validateDeskId(desk_id, callback)) return;

        try {
            socket.to('kitchen').emit('kitchen:orderReceived', { desk_id, orderDetails });
            callback(null, { message: 'Order sent to kitchen successfully' });
        } catch (error: any) {
            console.error('Error emitting to kitchen channel:', error); // Log errors
            callback({ message: error.message }, null);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    });
};

export { SocketController };
