import { Socket } from 'socket.io';
import { OrderDetail } from '../model';

const SocketController = (socket: Socket) => {
    console.log('New connection', socket.id);

    socket.on('join:desk', (desk_id) => {
        socket.join(desk_id);
        console.log(`Socket ${socket.id} joined desk ${desk_id}`);
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
            const orderDetails = await OrderDetail.getAll(desk_id);
            if (!orderDetails) throw new Error('No orders found for this desk');

            socket.to(desk_id).emit('order:details', orderDetails);
            callback(null, orderDetails);
        } catch (error: any) {
            callback({ message: error.message });
        }
    });

    socket.on('order:update', async (data, callback) => {
        try {
            const orderDetail = await OrderDetail.get(data.order_detail_id);
            if (!orderDetail) throw new Error('OrderDetail not found');

            await OrderDetail.update(orderDetail, orderDetail.id);
            socket.to(data.desk_id).emit('order:detail:updated', orderDetail);
            callback(null, orderDetail);
        } catch (error: any) {
            callback({ message: error.message });
        }
    });

    socket.on('order:delete', async (data, callback) => {
        const { order_detail_id } = data;
        try {
            const orderDetail = await OrderDetail.get(order_detail_id);
            if (!orderDetail) throw new Error('OrderDetail not found');

            await OrderDetail.delete(data.order_detail_id);
            socket.to(data.desk_id).emit('order:deleted', data.order_detail_id);
            callback(null, data.order_detail_id);
        } catch (error: any) {
            callback({ message: error.message });
        }
    });

    socket.on('order:delete:all', async (data, callback) => {
        const { desk_id } = data;
        try {
            await OrderDetail.deleteAll(desk_id);
            socket.to(desk_id).emit('order:deleted:all', desk_id);
            callback(null, desk_id);
        } catch (error: any) {
            callback({ message: error.message });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    });
};

export { SocketController };
