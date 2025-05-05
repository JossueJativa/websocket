import express from "express";
import cors from "cors";
import http from "http";
import { Server as ServerSocket } from "socket.io";

import { SocketController } from '../socket';
import '../db/init';

class Server {
    readonly app: express.Application;
    readonly port: string;
    readonly server: http.Server;
    readonly io: ServerSocket;

    constructor() {
        this.app = express();
        this.port = process.env.PORT || '3000'; // Use environment variable for port
        this.server = http.createServer(this.app);
        this.io = new ServerSocket(this.server, {
            cors: {
                origin: '*'
            },
            transports: ['websocket']
        });

        this.middlewares();

        this.socket();
    }

    middlewares() {
        this.app.use(cors());
    }

    socket() {
        this.io.on('connection', SocketController);
    }

    listen() {
        this.server.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
        });
    }
}

export { Server };