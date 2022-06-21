import { EventEmitter } from "events";

import express, { Express, json } from "express";
import { io } from "socket.io-client";

import { DiscoveryPack } from "@framework/types/communication/express";
import { RouteMapping, SocketPool, SocketPoolEntry } from "@framework/types/communication/socket";

export class Discovery {
    constructor(port = 3000) {
        this.port = port;
        this.httpServer = null;

        this.socketPool = {};
        this.emitter = new EventEmitter();
    }

    private port: number;
    private httpServer: Express | null;
    private socketPool: SocketPool | Record<string, never>;
    private emitter: EventEmitter;

    public initServer(): void {
        this.httpServer = express();
        this.httpServer.use(json());
        this.httpServer.post("/discovery", (req, res) => {
            const discoveryPack = DiscoveryPack.parse(req.body);

            const socket = io(`http://127.0.0.1:${discoveryPack.port}`, {
                transports: ["websocket"]
            });
            
            const socketPoolEntry: SocketPoolEntry = {
                interface: discoveryPack.routeMappings,
                socket
            };
            this.socketPool[socket.id] = socketPoolEntry;
            this.emitter.emit("register", socketPoolEntry);
            res.status(200);
        });
        this.httpServer.listen(this.port, "127.0.0.1");
    }

    public on(eventName: string, callback: (payload: any) => void): void {
        this.emitter.on(eventName, callback);
    }

    get sockets(): SocketPool {
        return this.socketPool;
    }
}