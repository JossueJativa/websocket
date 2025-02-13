import { Server } from 'socket.io';
import Client, { Socket } from 'socket.io-client';
import { createServer } from 'http';
import { SocketController } from '../socket';

describe('Socket Tests', () => {
    let io: Server, serverSocket, clientSocket: Socket;

    beforeAll((done) => {
        const httpServer = createServer();
        io = new Server(httpServer);
        io.on('connection', (socket) => {
            serverSocket = socket;
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
});
