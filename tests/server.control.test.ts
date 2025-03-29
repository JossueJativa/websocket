import request from 'supertest';
import { Server } from '../model/server.control';

describe('Server Control Tests', () => {
    let server: Server;

    beforeAll(() => {
        server = new Server();
    });

    it('should initialize the server and respond to requests', async () => {
        const response = await request(server.app).get('/');
        expect(response.status).toBe(404); // Default response for unhandled routes
    });

    it('should have CORS middleware configured', () => {
        const middlewares = server.app._router.stack.filter((layer: any) => layer.name === 'corsMiddleware');
        expect(middlewares.length).toBeGreaterThan(0);
    });
});

describe('Server tests', () => {
    it('should initialize and listen on the specified port', (done) => {
        const server = new Server();
        const mockListen = jest.spyOn(server.server, 'listen').mockImplementation((port: any, callback?: () => void) => {
            if (callback) callback();
            return server.server;
        });

        server.listen();

        expect(mockListen).toHaveBeenCalledWith('3000', expect.any(Function));
        mockListen.mockRestore();
        done();
    });
});
