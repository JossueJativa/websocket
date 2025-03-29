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
