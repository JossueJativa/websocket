import { Socket } from 'socket.io';
import moment from 'moment';
import { OrderHeader, OrderDetail } from '../model';
import { IDate, ITime } from '../interface';

const SocketController = (socket: Socket) => {
    console.log('New connection', socket.id);

    // Unir el socket a una sala específica basada en desk_id
    socket.on('join:desk', (desk_id) => {
        socket.join(desk_id);
        console.log(`Socket ${socket.id} joined desk ${desk_id}`);
    });

    socket.on('order:create', async (data, callback) => {
        try {
            const year = moment().year();
            const month = moment().month() + 1;
            const day = moment().date();
            const hours = moment().hour();
            const minutes = moment().minute();
            const seconds = moment().second();
            const date: IDate = { year, month, day };
            const time: ITime = { hours, minutes, seconds };
            const orderHeader = new OrderHeader(data.desk_id, time, date, 'PENDING');
            await OrderHeader.save(orderHeader);

            // Emitir solo a la mesa correspondiente
            socket.to(data.desk_id).emit('order:created', orderHeader);
            callback(null, orderHeader);
        } catch (error) {
            callback(error);
        }
    });

    socket.on('order:detail:create', async (data, callback) => {
        try {
            const orderDetail = new OrderDetail(data.order_header_id, data.product_id, data.quantity);
            await OrderDetail.save(orderDetail);

            // Emitir solo a la mesa correspondiente
            socket.to(data.desk_id).emit('order:detail:created', orderDetail);
            callback(null, orderDetail);
        } catch (error) {
            callback(error);
        }
    });

    socket.on('order:detail:delete', async (data, callback) => {
        try {
            const orderDetail = await OrderDetail.get(data.order_detail_id);
            if (!orderDetail) throw new Error('OrderDetail not found');

            await OrderDetail.delete(data.order_detail_id);
            socket.to(data.desk_id).emit('order:detail:deleted', data.order_detail_id);
            callback(null, data.order_detail_id);
        } catch (error: any) {
            callback({ message: error.message });
        }
    });

    socket.on('order:detail:update', async (data, callback) => {
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

    socket.on('order:status:update', async (data, callback) => {
        try {
            const orderHeader = await OrderHeader.get(data.order_header_id);
            if (!orderHeader) throw new Error('OrderHeader not found');

            orderHeader.order_status = data.status;
            await OrderHeader.update(orderHeader, orderHeader.id);
            socket.to(data.desk_id).emit('order:status:updated', orderHeader);
            callback(null, orderHeader);
        } catch (error: any) {
            callback({ message: error.message });
        }
    });

    socket.on('order:delete', async (data, callback) => {
        try {
            const orderHeader = await OrderHeader.get(data.order_header_id);
            if (!orderHeader) throw new Error('OrderHeader not found');

            await OrderHeader.delete(data.order_header_id);
            socket.to(data.desk_id).emit('order:deleted', data.order_header_id);
            callback(null, data.order_header_id);
        } catch (error: any) {
            callback({ message: error.message });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    });
};

export { SocketController };
