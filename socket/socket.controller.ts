import { Socket } from 'socket.io';
import { OrderDetail } from '../model';

const SocketController = (socket: Socket) => {
    console.log('New connection', socket.id);

    socket.on('join:desk', (desk_id) => {
        socket.join(desk_id);
        socket.emit('joined:desk', desk_id);
    });

    socket.on('order:create', async (data, callback) => {
        const { product_id, quantity, desk_id } = data;
        try {
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
        try {
            if (!desk_id) {
                callback({ message: 'Desk ID is required' }, null);
                return;
            }

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
        const { order_detail_id, desk_id } = data;
        try {
            if (!desk_id) {
                callback({ message: 'Desk ID is required' }, null);
                return;
            }

            const orderDetail = await OrderDetail.get(order_detail_id);
            if (!orderDetail) {
                callback({ message: 'OrderDetail not found' }, null);
                return;
            }

            await OrderDetail.update(orderDetail, orderDetail.id);
            socket.to(desk_id).emit('order:detail:updated', orderDetail);
            callback(null, orderDetail);
        } catch (error: any) {
            callback({ message: error.message }, null);
        }
    });

    socket.on('order:delete', async (data, callback) => {
        const { order_detail_id, desk_id } = data;
        try {
            if (!desk_id) {
                callback({ message: 'Desk ID is required' }, null);
                return;
            }

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
        try {
            if (!desk_id) {
                callback({ message: 'Desk ID is required' }, null);
                return;
            }

            const rowsDeleted = await OrderDetail.deleteAll(desk_id);
            if (rowsDeleted > 0) {
                socket.to(desk_id).emit('order:deleted:all', desk_id);
                callback(null, { desk_id, rowsDeleted }); // Send success response
            } else {
                callback({ message: 'No orders found to delete for the specified desk' }, null); // Send error if no rows deleted
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
