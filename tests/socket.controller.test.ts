import { Socket } from 'socket.io';
import { SocketController } from '../socket/socket.controller';

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

    it('should handle order:get event with missing desk_id', async () => {
        SocketController(mockSocket as Socket);

        const getHandler = (mockSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'order:get')[1];
        const callback = jest.fn();

        await getHandler({}, callback);

        expect(callback).toHaveBeenCalledWith({ message: 'Desk ID is required' }, null);
    });

    it('should handle order:update event with missing desk_id', async () => {
        SocketController(mockSocket as Socket);

        const updateHandler = (mockSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'order:update')[1];
        const callback = jest.fn();

        await updateHandler({ order_detail_id: 1 }, callback);

        expect(callback).toHaveBeenCalledWith({ message: 'Desk ID is required' }, null);
    });

    it('should handle order:delete:all event', async () => {
        SocketController(mockSocket as Socket);

        const deleteAllHandler = (mockSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'order:delete:all')[1];
        const callback = jest.fn();

        await deleteAllHandler({ desk_id: 1 }, callback);

        expect(callback).toHaveBeenCalledWith(null, 1);
    });

    it('should handle disconnect event', () => {
        SocketController(mockSocket as Socket);

        const disconnectHandler = (mockSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'disconnect')[1];
        disconnectHandler();

        expect(console.log).toHaveBeenCalledWith('User disconnected', mockSocket.id);
    });
});
