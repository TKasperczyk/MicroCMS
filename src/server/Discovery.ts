import { EventEmitter } from "events";

import express, { Express, json } from "express";
import { io, Socket } from "socket.io-client";

import { appLogger } from "@framework";

import { TDiscoveryPack } from "@framework/types/communication/express";
import { TSocketPool, TSocketPoolEntry } from "@framework/types/communication/socket";
import { TSetupObject } from "@framework/types/service";

const ml = appLogger("discovery");

export class Discovery {
    constructor(port = 3000, baseServicePort = 4000) {
        this.port = port;
        this.nextServicePort = baseServicePort;
        this.httpServer = null;

        this.socketPool = {};
        this.emitter = new EventEmitter();
    }

    private port: number;
    private nextServicePort: number;
    private httpServer: Express | null;
    private socketPool: TSocketPool | Record<string, never>;
    private emitter: EventEmitter;

    public initServer(): void {
        this.httpServer = express();
        this.httpServer.use(json());
        this.httpServer.post("/discovery", (req, res) => {
            ml.info("A new service request, parsing the discovery pack...");
            let discoveryPack: TDiscoveryPack;
            try {
                discoveryPack = TDiscoveryPack.parse(req.body);
            } catch (error) {
                ml.error(`Failed to parse the discovery pack: ${String(error)}`);
                return;
            }
            
            const servicePort = this.nextServicePort++;
            ml.info(`Sending the setup object to: ${discoveryPack.serviceId} with port ${servicePort}`); 
            res.status(200).json({ port: servicePort } as TSetupObject);
            
            ml.info(`Creating a socket for ${discoveryPack.serviceId} and waiting for connection`);
            const socket = io(`http://127.0.0.1:${servicePort}`, {
                transports: ["websocket"],
            });
            let socketId = "";
            socket.on("connect", () => {
                ml.info(`The service ${discoveryPack.serviceId} is now connected, registering`);
                socketId = socket.id;
                try {
                    this.registerService(socket, discoveryPack, servicePort);
                } catch (error) {
                    ml.error({ discoveryPack }, `Error while registering a service ${discoveryPack.serviceId}: ${String(error)}`);
                    this.shutdownService(socket);
                    this.turnOffSocket(socket);
                    return;
                }
                ml.info(`Registered a new service: ${discoveryPack.serviceId}. The socket ${socketId} is connected on port ${servicePort}`);
            });
            socket.on("disconnect", (reason) => {
                ml.warn(`Socket ${socketId} disconnected: ${reason} (${discoveryPack.serviceId}). Unregistering this service`);
                try {
                    this.unregisterService(discoveryPack.serviceId);
                } catch (error) {
                    ml.error(`Error while unregistering a service ${discoveryPack.serviceId}: ${String(error)}`);
                }
            });
        });
        this.httpServer.listen(this.port, "127.0.0.1");
        ml.info(`Listening on port ${this.port}`);
    }
    public on(eventName: string, callback: (...args: any[]) => void): void { //eslint-disable-line @typescript-eslint/no-explicit-any
        this.emitter.on(eventName, callback);
    }
    
    private shutdownService(socket: Socket): void {
        socket.emit("shutdown");
    }
    private turnOffSocket(socket: Socket): void {
        socket.offAny().removeAllListeners().close();
    }
    private registerService(socket: Socket, discoveryPack: TDiscoveryPack, servicePort: number): void {
        if (typeof this.socketPool[discoveryPack.serviceId] !== "undefined") {
            throw new Error(`Tried to register an already existing service: ${discoveryPack.serviceId}`);
        }
        const socketPoolEntry: TSocketPoolEntry = {
            interface: discoveryPack.routeMappings,
            socket,
            servicePort,
            serviceId: discoveryPack.serviceId
        };
        this.socketPool[discoveryPack.serviceId] = socketPoolEntry;
        this.emitter.emit("register", socketPoolEntry);
    }
    private unregisterService(serviceId: string): void {
        if (this.socketPool[serviceId]?.socket instanceof Socket) {
            this.turnOffSocket(this.socketPool[serviceId].socket);
            delete this.socketPool[serviceId];
        }
        this.emitter.emit("unregister", serviceId);
    }

    get sockets(): TSocketPool {
        return this.socketPool;
    }
}