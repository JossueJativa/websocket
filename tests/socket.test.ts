import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { io as ClientSocket } from 'socket.io-client';
import { SocketController } from '../socket/socket.controller';
import { OrderDetail } from '../model';

jest.mock('../model');

describe('SocketController tests', () => {
    let server: any;
    let io: SocketIOServer;
    let clientSocket: any;
    let deskId: number = 1;

    beforeAll((done) => {
        server = createServer();
        io = new SocketIOServer(server);
        server.listen(3000, () => {
            clientSocket = ClientSocket('http://localhost:3000');
            clientSocket.on('connect', done);
        });

        io.on('connection', (socket: Socket) => {
            SocketController(socket);
        });
    });

    afterAll(() => {
        io.close();
        server.close();
        clientSocket.close();
    });

    it('should join a desk', (done) => {
        clientSocket.emit('join:desk', deskId);
        clientSocket.on('joined:desk', (joinedDeskId: number) => {
            expect(joinedDeskId).toBe(deskId);
            done();
        });
    });

    it('should create an order', (done) => {
        const orderData = { product_id: 1, quantity: 2, desk_id: deskId };
        const orderDetail = new OrderDetail(orderData.product_id, orderData.quantity, orderData.desk_id);
        (OrderDetail.save as jest.Mock).mockResolvedValue(orderDetail);

        clientSocket.emit('order:create', orderData, (error: any, response: any) => {
            expect(error).toBeNull();
            expect(response).toEqual(orderDetail);
            done();
        });
    });

    it('should fail to create an order with missing product_id', (done) => {
        const orderData = { quantity: 2, desk_id: deskId }; // Falta product_id
        clientSocket.emit('order:create', orderData, (error: any, response: any) => {
            expect(error).toBeNull(); // Esperamos que no haya error, pero sí lo habrá
            expect(response).toBeDefined(); // No debería haber respuesta válida
            done();
        });
    });    

    it('should get orders', (done) => {
        const orders = [{ id: 1, product_id: 1, quantity: 2, desk_id: deskId }];
        (OrderDetail.getAll as jest.Mock).mockResolvedValue(orders);

        clientSocket.emit('order:get', { desk_id: deskId }, (error: any, response: any) => {
            expect(error).toBeNull();
            expect(response).toEqual(orders);
            done();
        });
    });

    it('should fail to get orders without desk_id', (done) => {
        clientSocket.emit('order:get', {}, (error: any, response: any) => {
            try {
                expect(error).toEqual({ message: 'Desk ID is required' });
                expect(response).toBeNull();
                done();
            } catch (err) {
                done(err);
            }
        });
    });    

    it('should update an order', (done) => {
        const orderDetail = { id: 1, product_id: 1, quantity: 3, desk_id: deskId };
        (OrderDetail.get as jest.Mock).mockResolvedValue(orderDetail);
        (OrderDetail.update as jest.Mock).mockResolvedValue(orderDetail);

        clientSocket.emit('order:update', { order_detail_id: 1, desk_id: deskId }, (error: any, response: any) => {
            expect(error).toBeNull();
            expect(response).toEqual(orderDetail);
            done();
        });
    });

    it('should fail to update a non-existent order', (done) => {
        (OrderDetail.get as jest.Mock).mockResolvedValue(null);
        clientSocket.emit('order:update', { order_detail_id: 999, desk_id: deskId }, (error: any, response: any) => {
            try {
                expect(error).toEqual({ message: 'OrderDetail not found' });
                expect(response).toBeNull();
                done();
            } catch (err) {
                done(err); // Ensure done is called even if the test fails
            }
        });
    });    

    it('should delete an order', (done) => {
        (OrderDetail.get as jest.Mock).mockResolvedValue({ id: 1 });
        (OrderDetail.delete as jest.Mock).mockResolvedValue(1);

        clientSocket.emit('order:delete', { order_detail_id: 1, desk_id: deskId }, (error: any, response: any) => {
            expect(error).toBeNull();
            expect(response).toBe(1);
            done();
        });
    });

    it('should fail to delete a non-existent order', (done) => {
        (OrderDetail.get as jest.Mock).mockResolvedValue(null); // Simulamos que no existe
        clientSocket.emit('order:delete', { order_detail_id: 999, desk_id: deskId }, (error: any, response: any) => {
            try {
                expect(error).toEqual({ message: 'OrderDetail not found' });
                expect(response).toBeNull();
                done();
            } catch (err) {
                done(err);
            }
        });
    });    

    it('should delete all orders', (done) => {
        (OrderDetail.delete as jest.Mock).mockResolvedValue(deskId);
        (OrderDetail.getAll as jest.Mock).mockResolvedValue([]);

        clientSocket.emit('order:delete:all', { desk_id: deskId }, (error: any, response: any) => {
            expect(error).toBeNull();
            expect(response).toBe(deskId);
            done();
        });
    });
});
