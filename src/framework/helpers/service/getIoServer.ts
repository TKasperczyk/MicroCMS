import { createServer } from "http";

import { Server } from "socket.io";

export const getIoServer = () => {
    const httpServer = createServer();
    const io = new Server(httpServer, {
        transports: ["websocket"]
    });
    return { io, httpServer };
};