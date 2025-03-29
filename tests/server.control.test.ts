import { Server } from '../model/server.control';
import { io as Client } from 'socket.io-client';

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

    test('should handle join:desk event', (done) => {
        const client = Client('http://localhost:3000', {
            transports: ['websocket']
        });

        client.on('connect', () => {
            client.emit('join:desk', 1, () => {
                client.disconnect();
                done();
            });
        });
    });

    test('should handle order:create event', (done) => {
        const client = Client('http://localhost:3000', {
            transports: ['websocket']
        });

        client.on('connect', () => {
            client.emit('order:create', { product_id: 1, quantity: 2, desk_id: 1 }, (error: any, orderDetail: any) => {
                expect(error).toBeNull();
                expect(orderDetail).toMatchObject({
                    product_id: 1,
                    quantity: 2,
                    desk_id: 1
                });
                client.disconnect();
                done();
            });
        });
    });

    test('should handle order:get event', (done) => {
        const client = Client('http://localhost:3000', {
            transports: ['websocket']
        });

        client.on('connect', () => {
            client.emit('order:get', { desk_id: 1 }, (error: any, orderDetails: any) => {
                expect(error).toBeNull();
                expect(orderDetails).toBeInstanceOf(Array);
                client.disconnect();
                done();
            });
        });
    });

    test('should handle order:update event', (done) => {
        const client = Client('http://localhost:3000', {
            transports: ['websocket']
        });

        client.on('connect', () => {
            client.emit('order:update', { order_detail_id: 1, desk_id: 1 }, (error: any, orderDetail: any) => {
                expect(error).toBeNull();
                expect(orderDetail).toMatchObject({
                    id: 1
                });
                client.disconnect();
                done();
            });
        });
    });

    test('should handle order:delete event', (done) => {
        const client = Client('http://localhost:3000', {
            transports: ['websocket']
        });

        client.on('connect', () => {
            client.emit('order:delete', { order_detail_id: 1, desk_id: 1 }, (error: any, orderDetailId: any) => {
                expect(error).toBeNull();
                expect(orderDetailId).toBe(1);
                client.disconnect();
                done();
            });
        });
    });

    test('should handle order:delete:all event', (done) => {
        const client = Client('http://localhost:3000', {
            transports: ['websocket']
        });

        client.on('connect', () => {
            client.emit('order:delete:all', { desk_id: 1 }, (error: any, deskId: any) => {
                expect(error).toBeNull();
                expect(deskId).toBe(1);
                client.disconnect();
                done();
            });
        });
    });

    test('should fail to create order with invalid data', (done) => {
        const client = Client('http://localhost:3000', {
            transports: ['websocket']
        });

        client.on('connect', () => {
            client.emit('order:create', { desk_id: null }, (error: any, orderDetail: any) => {
                expect(error).not.toBeNull();
                expect(orderDetail).toBeUndefined();
                client.disconnect();
                done();
            });
        });
    });

    test('should fail to update order with invalid data', (done) => {
        const client = Client('http://localhost:3000', {
            transports: ['websocket']
        });

        client.on('connect', () => {
            client.emit('order:update', { order_detail_id: null, desk_id: 1 }, (error: any, orderDetail: any) => {
                expect(error).not.toBeNull();
                expect(orderDetail).toBeUndefined();
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
                client2.emit('order:create', { product_id: 1, quantity: 2, desk_id: 2 }, (error: any, orderDetail: any) => {
                    expect(error).toBeNull();
                    expect(orderDetail).toMatchObject({
                        product_id: 1,
                        quantity: 2,
                        desk_id: 2
                    });

                    client1.on('order:created', (data: any) => {
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
