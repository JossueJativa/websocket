import { Server } from '../model/server.control';
import { io as Client, io } from 'socket.io-client';

describe('Server Control Tests', () => {
    let server: Server;

    beforeAll((done) => {
        server = new Server();
        server.listen();
        done();
    });

    afterAll(async () => {
        await new Promise((resolve) => server.server.close(resolve));
    }, 10000);     

    test('should handle socket connection', (done) => {
        const client = Client('http://localhost:3000', {
            transports: ['websocket']
        });

        client.on('connect', () => {
            expect(client.connected).toBe(true);
            client.disconnect();
            done();
        });
    });

    test('should handle order:create event', (done) => {
        const client = Client('http://localhost:3000', {
            transports: ['websocket']
        });

        client.on('connect', () => {
            client.emit('order:create', { desk_id: 1 }, (error: any, orderHeader: any) => {
                expect(error).toBeNull();
                expect(orderHeader).toMatchObject({
                    desk_id: 1,
                    order_status: 'PENDING'
                });
                client.disconnect();
                done();
            });
        });
    });

    test('should handle order:detail:create event', (done) => {
        const client = Client('http://localhost:3000', {
            transports: ['websocket']
        });

        client.on('connect', () => {
            client.emit('order:detail:create', { order_header_id: 1, product_id: 1, quantity: 2 }, (error: any, orderDetail: any) => {
                expect(error).toBeNull();
                expect(orderDetail).toMatchObject({
                    order_header_id: 1,
                    product_id: 1,
                    quantity: 2
                });
                client.disconnect();
                done();
            });
        });
    });

    // Pruebas para eventos que deberían fallar
    test('should fail to create order with invalid data', (done) => {
        const client = Client('http://localhost:3000', {
            transports: ['websocket']
        });

        client.on('connect', () => {
            client.emit('order:create', { desk_id: null }, (error: any, orderHeader: any) => {
                expect(error).not.toBeNull();
                expect(orderHeader).toBeUndefined();
                client.disconnect();
                done();
            });
        });
    });

    test('should fail to create order detail with invalid data', (done) => {
        const client = Client('http://localhost:3000', {
            transports: ['websocket']
        });

        client.on('connect', () => {
            client.emit('order:detail:create', { order_header_id: null, product_id: null, quantity: null }, (error: any, orderDetail: any) => {
                expect(error).not.toBeNull();
                expect(orderDetail).toBeUndefined();
                client.disconnect();
                done();
            });
        });
    });

    test('should fail to update order status with invalid data', (done) => {
        const client = Client('http://localhost:3000', {
            transports: ['websocket']
        });

        client.on('connect', () => {
            client.emit('order:status:update', { order_header_id: null, status: 'COMPLETED' }, (error: any, orderHeader: any) => {
                expect(error).not.toBeNull();
                expect(orderHeader).toBeUndefined();
                client.disconnect();
                done();
            });
        });
    });

    test('should not receive messages for desk_id 2 on desk_id 1', (done) => {
        const client1 = Client('http://localhost:3000', {
            transports: ['websocket']
        });

        const client2 = Client('http://localhost:3000', {
            transports: ['websocket']
        });

        client1.on('connect', () => {
            client2.on('connect', () => {
                client2.emit('order:create', { desk_id: 2 }, (error: any, orderHeader: any) => {
                    expect(error).toBeNull();
                    expect(orderHeader).toMatchObject({
                        desk_id: 2,
                        order_status: 'PENDING'
                    });

                    client1.on('order:create', (data: any) => {
                        // This should not be called
                        expect(data).toBeUndefined();
                    });

                    setTimeout(() => {
                        client1.disconnect();
                        client2.disconnect();
                        done();
                    }, 1000);
                });
            });
        });
    });
});
