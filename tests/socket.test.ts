import { Server } from 'socket.io';
import Client, { Socket } from 'socket.io-client';
import { createServer } from 'http';
import { SocketController } from '../socket';

describe('Socket Tests', () => {
    let io: Server, clientSocket: Socket;

    beforeAll((done) => {
        const httpServer = createServer();
        io = new Server(httpServer);
        io.on('connection', (socket) => {
            SocketController(socket);
        });
        httpServer.listen(() => {
            const address = httpServer.address();
            const port = (address as any).port;
            clientSocket = Client(`http://localhost:${port}`);
            clientSocket.on('connect', done);
        });
    });

    afterAll(() => {
        io.close();
        clientSocket.close();
    });

    test('should create order', (done) => {
        clientSocket.emit('order:create', { desk_id: 1 }, (err: any, orderHeader: any) => {
            expect(err).toBeNull();
            expect(orderHeader).toMatchObject({
                desk_id: 1,
                order_status: 'PENDING'
            });
            done();
        });
    });

    test('should create order detail', (done) => {
        clientSocket.emit('order:detail:create', { order_header_id: 1, product_id: 1, quantity: 2 }, (err: any, orderDetail: any) => {
            expect(err).toBeNull();
            expect(orderDetail).toMatchObject({
                order_header_id: 1,
                product_id: 1,
                quantity: 2
            });
            done();
        });
    });

    test('should fail to create order with invalid desk_id', (done) => {
        clientSocket.emit('order:create', { desk_id: null }, (err: any, orderHeader: any) => {
            expect(err).not.toBeNull();
            done();
        });
    });

    test('should create multiple order details', (done) => {
        clientSocket.emit('order:detail:create', { order_header_id: 1, product_id: 1, quantity: 2 }, (err: any, orderDetail: any) => {
            expect(err).toBeNull();
            expect(orderDetail).toMatchObject({
                order_header_id: 1,
                product_id: 1,
                quantity: 2
            });

            clientSocket.emit('order:detail:create', { order_header_id: 1, product_id: 2, quantity: 3 }, (err: any, orderDetail: any) => {
                expect(err).toBeNull();
                expect(orderDetail).toMatchObject({
                    order_header_id: 1,
                    product_id: 2,
                    quantity: 3
                });
                done();
            });
        });
    });

    test('should update order status', (done) => {
        clientSocket.emit('order:status:update', { order_header_id: 1, status: 'COMPLETED' }, (err: any, orderHeader: any) => {
            expect(err).toBeNull();
            expect(orderHeader).toMatchObject({
                id: 1,
                order_status: 'COMPLETED'
            });
            done();
        });
    });

    test('should delete order detail', (done) => {
        clientSocket.emit('order:detail:delete', { order_detail_id: 1 }, (err: any, orderDetailId: any) => {
            expect(err).toBeNull();
            expect(orderDetailId).toBe(1);
            done();
        });
    });

    test('should fail to update non-existent order detail', (done) => {
        clientSocket.emit('order:detail:update', { order_detail_id: 999 }, (err: any, orderDetail: any) => {
            expect(err).not.toBeNull();
            expect(err.message).toBe('OrderDetail not found');
            done();
        });
    });

    test('should fail to update order status with non-existent order', (done) => {
        clientSocket.emit('order:status:update', { order_header_id: 999, status: 'COMPLETED' }, (err: any, orderHeader: any) => {
            expect(err).not.toBeNull();
            expect(err.message).toBe('OrderHeader not found');
            done();
        });
    });

    test('should fail to delete non-existent order detail', (done) => {
        clientSocket.emit('order:detail:delete', { order_detail_id: 999 }, (err: any, orderDetailId: any) => {
            expect(err).not.toBeNull();
            expect(err.message).toBe('OrderDetail not found');
            done();
        });
    });

    test('should fail to delete non-existent order', (done) => {
        clientSocket.emit('order:delete', { order_header_id: 999 }, (err: any, orderHeaderId: any) => {
            expect(err).not.toBeNull();
            expect(err.message).toBe('OrderHeader not found');
            done();
        });
    });

    test('should fail to delete non-existent order detail', (done) => {
        clientSocket.emit('order:detail:delete', { order_detail_id: 999 }, (err: any, orderDetailId: any) => {
            expect(err).not.toBeNull();
            done();
        });
    });

    test('should fail to delete non-existent order', (done) => {
        clientSocket.emit('order:delete', { order_header_id: 999 }, (err: any, orderHeaderId: any) => {
            expect(err).not.toBeNull();
            done();
        });
    });
});
