import { Socket } from 'socket.io';
import { SocketController } from '../socket/socket.controller';
import { OrderDetail } from '../model';

jest.mock('../model', () => ({
    OrderDetail: {
        get: jest.fn(),
        getAll: jest.fn(),
        deleteAll: jest.fn(),
        update: jest.fn(),
        save: jest.fn(),
    },
}));

describe('SocketController tests', () => {
    let mockSocket: Partial<Socket>;

    beforeEach(() => {
        mockSocket = {
            on: jest.fn(),
            emit: jest.fn(),
            join: jest.fn(),
            to: jest.fn().mockReturnValue({ emit: jest.fn() }),
        };
        jest.spyOn(console, 'log').mockImplementation(() => {}); // Mock console.log
    });

    afterEach(() => {
        jest.restoreAllMocks(); // Restore original console.log
    });

    it('should handle join:desk event', () => {
        SocketController(mockSocket as Socket);

        const joinHandler = (mockSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'join:desk')[1];
        joinHandler(1);

        expect(mockSocket.join).toHaveBeenCalledWith(1);
        expect(mockSocket.emit).toHaveBeenCalledWith('joined:desk', 1);
    });

    it('should handle order:create event with invalid data', async () => {
        SocketController(mockSocket as Socket);

        const createHandler = (mockSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'order:create')[1];
        const callback = jest.fn();

        await createHandler({ product_id: null, quantity: 2, desk_id: 1 }, callback);

        expect(callback).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should update an existing order when product_id matches', async () => {
        SocketController(mockSocket as Socket);

        const createHandler = (mockSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'order:create')[1];
        const callback = jest.fn();
        const existingOrder = { id: 1, product_id: '123', quantity: 2 };

        (OrderDetail.getAll as jest.Mock).mockResolvedValue([existingOrder]);
        (OrderDetail.update as jest.Mock).mockResolvedValue(true);

        await createHandler({ product_id: '123', quantity: 3, desk_id: 'desk1' }, callback);

        expect(existingOrder.quantity).toBe(5); // Quantity updated
        expect(OrderDetail.update).toHaveBeenCalledWith(existingOrder, existingOrder.id);
        expect(mockSocket.to).toHaveBeenCalledWith('desk1');
        expect(callback).toHaveBeenCalledWith(null, existingOrder);
    });

    it('should handle order:get event with missing desk_id', async () => {
        SocketController(mockSocket as Socket);

        const getHandler = (mockSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'order:get')[1];
        const callback = jest.fn();

        await getHandler({}, callback);

        expect(callback).toHaveBeenCalledWith({ message: 'Desk ID is required' }, null);
    });

    it('should update quantity when product exists with same garrison', async () => {
        SocketController(mockSocket as Socket);
    
        const createHandler = (mockSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'order:create')[1];
        const callback = jest.fn();
        const existingOrder = { id: 1, product_id: '123', quantity: 2, desk_id: 'desk1', garrison: [1, 2] };
    
        (OrderDetail.getAll as jest.Mock).mockResolvedValue([existingOrder]);
        (OrderDetail.update as jest.Mock).mockResolvedValue(true);
    
        await createHandler({ product_id: '123', quantity: 3, desk_id: 'desk1', garrison: [1, 2] }, callback);
    
        expect(existingOrder.quantity).toBe(5); // La cantidad debe actualizarse
        expect(OrderDetail.update).toHaveBeenCalledWith(existingOrder, existingOrder.id);
        expect(mockSocket.to).toHaveBeenCalledWith('desk1');
        expect(callback).toHaveBeenCalledWith(null, existingOrder);
    }); 

    it('should handle order:get event with no orders found', async () => {
        SocketController(mockSocket as Socket);

        const getHandler = (mockSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'order:get')[1];
        const callback = jest.fn();

        (OrderDetail.getAll as jest.Mock).mockResolvedValue(null);

        await getHandler({ desk_id: 1 }, callback);

        expect(callback).toHaveBeenCalledWith({ message: 'No orders found for the specified desk' }, null);
    });

    it('should handle order:update event with missing desk_id', async () => {
        SocketController(mockSocket as Socket);

        const updateHandler = (mockSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'order:update')[1];
        const callback = jest.fn();

        await updateHandler({ order_detail_id: 1 }, callback);

        expect(callback).toHaveBeenCalledWith({ message: 'Desk ID is required' }, null);
    });

    it('should handle order:update event with non-existent order', async () => {
        SocketController(mockSocket as Socket);

        const updateHandler = (mockSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'order:update')[1];
        const callback = jest.fn();

        (OrderDetail.get as jest.Mock).mockResolvedValue(null);

        await updateHandler({ order_detail_id: 1, desk_id: 1 }, callback);

        expect(callback).toHaveBeenCalledWith({ message: 'OrderDetail not found' }, null);
    });

    it('should handle order:delete event with non-existent order', async () => {
        SocketController(mockSocket as Socket);

        const deleteHandler = (mockSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'order:delete')[1];
        const callback = jest.fn();

        (OrderDetail.get as jest.Mock).mockResolvedValue(null);

        await deleteHandler({ order_detail_id: 1, desk_id: 1 }, callback);

        expect(callback).toHaveBeenCalledWith({ message: 'OrderDetail not found' }, null);
    });

    it('should handle order:delete:all event', async () => {
        SocketController(mockSocket as Socket);

        const deleteAllHandler = (mockSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'order:delete:all')[1];
        const callback = jest.fn();

        (OrderDetail.deleteAll as jest.Mock).mockResolvedValue(1); // Simulate 1 row deleted

        await deleteAllHandler({ desk_id: 1 }, callback);

        expect(callback).toHaveBeenCalledWith(null, { desk_id: 1, rowsDeleted: 1 });
    });

    it('should handle order:delete:all event successfully', async () => {
        SocketController(mockSocket as Socket);

        const deleteAllHandler = (mockSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'order:delete:all')[1];
        const callback = jest.fn();

        (OrderDetail.deleteAll as jest.Mock).mockResolvedValue(3); // Simulate 3 rows deleted

        await deleteAllHandler({ desk_id: 1 }, callback);

        expect(callback).toHaveBeenCalledWith(null, { desk_id: 1, rowsDeleted: 3 });
    });

    it('should handle order:delete:all event with no orders found', async () => {
        SocketController(mockSocket as Socket);

        const deleteAllHandler = (mockSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'order:delete:all')[1];
        const callback = jest.fn();

        (OrderDetail.deleteAll as jest.Mock).mockResolvedValue(0); // Simulate no rows deleted

        await deleteAllHandler({ desk_id: 1 }, callback);

        expect(callback).toHaveBeenCalledWith({ message: 'No orders found to delete for the specified desk' }, null);
    });

    it('should handle order:delete:all event with failure', async () => {
        SocketController(mockSocket as Socket);

        const deleteAllHandler = (mockSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'order:delete:all')[1];
        const callback = jest.fn();

        (OrderDetail.deleteAll as jest.Mock).mockResolvedValue(null); // Simulate failure (null result)

        await deleteAllHandler({ desk_id: 1 }, callback);

        expect(callback).toHaveBeenCalledWith({ message: 'No orders found to delete for the specified desk' }, null);
    });

    it('should handle order:delete:all event with missing desk_id', async () => {
        SocketController(mockSocket as Socket);

        const deleteAllHandler = (mockSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'order:delete:all')[1];
        const callback = jest.fn();

        await deleteAllHandler({}, callback);

        expect(callback).toHaveBeenCalledWith({ message: 'Desk ID is required' }, null);
    });

    it('should handle disconnect event', () => {
        SocketController(mockSocket as Socket);

        const disconnectHandler = (mockSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'disconnect')[1];
        disconnectHandler();

        expect(console.log).toHaveBeenCalledWith('User disconnected', mockSocket.id);
    });

    it('should handle disconnect event and log message', () => {
        SocketController(mockSocket as Socket);

        const disconnectHandler = (mockSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'disconnect')[1];
        disconnectHandler();

        expect(console.log).toHaveBeenCalledWith('User disconnected', mockSocket.id);
    });
});