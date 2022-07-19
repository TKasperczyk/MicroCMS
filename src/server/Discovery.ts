import { EventEmitter } from "events";

import express, { Express, json } from "express";
import { io, Socket } from "socket.io-client";

import { appLogger } from "@framework";
import { getErrorMessage } from "@framework/helpers";

import { TDiscoveryPack } from "@framework/types/communication/express";
import { TSocketPool, TSocketPoolEntry } from "@framework/types/communication/socket";
import { TSetupObject } from "@framework/types/service";

const ml = appLogger("discovery");

export class Discovery {
    constructor(port = 3000, baseServicePort = 4000) {
        this.port = port;
        this.nextServicePort = baseServicePort;
        this.httpServer = null;

        this.emitter = new EventEmitter();
    }

    private port: number;
    private nextServicePort: number;
    private httpServer: Express | null;
    private emitter: EventEmitter;

    private static socketPool: TSocketPool | Record<string, never> = {};

    public initServer(): void {
        this.httpServer = express();
        this.httpServer.use(json());
        this.httpServer.post("/discovery", (req, res) => {
            ml.info("A new service request, parsing the discovery pack...");
            const discoveryPack = this.parseDiscoveryPack(req.body);
            if (!discoveryPack) return;
            
            const servicePort = this.nextServicePort++;
            ml.info(`Sending the setup object to: ${discoveryPack.serviceId} with port ${servicePort}`); 
            res.status(200).json({ port: servicePort } as TSetupObject);
            
            ml.info(`Creating a socket for ${discoveryPack.serviceId} and waiting for connection`);
            const socket = io(`http://127.0.0.1:${servicePort}`, {
                transports: ["websocket"],
            });

            this.createSocketListeners(socket, discoveryPack, servicePort);
        });
        this.httpServer.listen(this.port, "127.0.0.1");
        ml.info(`Listening on port ${this.port}`);
    }
    public on(eventName: string, callback: (...args: any[]) => any): void { //eslint-disable-line @typescript-eslint/no-explicit-any
        this.emitter.on(eventName, callback);
    }
    
    private createSocketListeners(socket: Socket, discoveryPack: TDiscoveryPack, servicePort: number) {
        socket.on("connect", () => {
            ml.info(`The service ${discoveryPack.serviceId} is now connected, registering`);
            try {
                this.registerService(socket, discoveryPack, servicePort);
            } catch (error) {
                ml.error({ discoveryPack }, `Error while registering a service ${discoveryPack.serviceId}: ${getErrorMessage(error)}`);
                this.shutdownService(socket);
                return;
            }
            ml.info(`Registered a new service: ${discoveryPack.serviceId}. The socket ${socket.id} is connected on port ${servicePort}`);
        });
        socket.on("disconnect", (reason) => {
            ml.warn(`Socket ${socket.id} disconnected: ${reason} (${discoveryPack.serviceId}). Unregistering this service`);
            try {
                this.unregisterService(discoveryPack.serviceId);
            } catch (error) {
                ml.error(`Error while unregistering a service ${discoveryPack.serviceId}: ${getErrorMessage(error)}`);
            }
        });
    }
    private parseDiscoveryPack(discoveryPack: unknown): TDiscoveryPack | null {
        try {
            return TDiscoveryPack.parse(discoveryPack);
        } catch (error) {
            ml.error(`Failed to parse the discovery pack: ${getErrorMessage(error)}`);
        }
        return null;
    }
    private shutdownService(socket: Socket): void {
        socket.offAny().removeAllListeners().close();
        socket.emit("shutdown");
    }
    private turnOffSocket(socket: Socket): void {
        socket.offAny().removeAllListeners().close();
    }
    private registerService(socket: Socket, discoveryPack: TDiscoveryPack, servicePort: number): void {
        if (typeof this.sockets[discoveryPack.serviceId] !== "undefined") {
            throw new Error(`Tried to register an already existing service: ${discoveryPack.serviceId}`);
        }
        const socketPoolEntry: TSocketPoolEntry = {
            interface: discoveryPack.routeMappings,
            socket,
            servicePort,
            serviceId: discoveryPack.serviceId
        };
        this.sockets[discoveryPack.serviceId] = socketPoolEntry;
        this.emitter.emit("register", discoveryPack.serviceId);
    }
    private unregisterService(serviceId: string): void {
        if (!this.sockets[serviceId]) {
            return;
        }
        if (this.sockets[serviceId]?.socket instanceof Socket) {
            this.turnOffSocket(this.sockets[serviceId].socket);
            delete this.sockets[serviceId];
        }
        this.emitter.emit("unregister", serviceId);
    }

    get sockets(): TSocketPool {
        return Discovery.socketPool;
    }
}