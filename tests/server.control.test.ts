import { Server } from '../model/server.control';
import { io as Client } from 'socket.io-client';

describe('Server Control Tests', () => {
    let server: Server;

    beforeAll((done) => {
        server = new Server();
        server.listen();
        done();
    });

    afterAll((done) => {
        server.server.close(done);
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
    }, 10000);

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
    }, 10000);

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
    }, 10000);

    test('should handle order:status:update event', (done) => {
        const client = Client('http://localhost:3000', {
            transports: ['websocket']
        });

        client.on('connect', () => {
            client.emit('order:status:update', { order_header_id: 1, status: 'COMPLETED' }, (error: any, orderHeader: any) => {
                expect(error).toBeNull();
                expect(orderHeader.order_status).toBe('COMPLETED');
                client.disconnect();
                done();
            });
        });
    }, 10000);

    // Tests for events that should fail
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
    }, 10000);

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
    }, 10000);

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
    }, 10000);
});
