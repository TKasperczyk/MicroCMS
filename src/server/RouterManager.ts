import { randomUUID } from "crypto";

import { Router as Router, Request, Response, NextFunction } from "express";
import { Socket } from "socket.io-client";

import { appLogger, reqLogger } from "@framework";

import { Methods, RequestQueue, RequestQueueEntry, CmsRequestResponse } from "@framework/types/communication/express";
import { SocketPool, SocketPoolEntry, CmsMessageResponse } from "@framework/types/communication/socket";

const ml = appLogger("routerManager");
const rl = reqLogger("routerManager");

export class RouterManager {
    constructor() {
        this.router = Router();
        this.expressMethods = {
            get: typeof this.router.get,
            put: typeof this.router.put,
            post: typeof this.router.post,
            delete: typeof this.router.delete
        };
        this.RequestQueue = {};
    }

    private expressMethods: Methods;
    private router: Router;
    private RequestQueue: RequestQueue;

    public middleware(req: Request, res: Response, next: NextFunction): void {
        return this.router(req, res, next);
    }
    public replace(socketPool: SocketPool): void {
        ml.info("Replacing the express router");
        this.recreateExpressRouter();
    
        for (const serviceId of Object.keys(socketPool)) {
            const socketPoolEntry = socketPool[serviceId as keyof SocketPool];
            ml.debug(`Connecting ${serviceId} with express`);
            try {
                this.connectRouterWithSocket(socketPoolEntry);
            } catch (error) {
                ml.error({ socketPoolEntry }, `Couldn't connect a socket interface with an express route: ${String(error)}`);
                return;
            }
        }
    }
    public getRequest(requestId: string): RequestQueueEntry {
        if (!this.RequestQueue[requestId]) {
            throw new Error(`Asking for an unknown request for request ${requestId}`);
        }
        return this.RequestQueue[requestId as keyof RequestQueue];
    }
    public removeRequest(requestId: string): void {
        rl.trace({ requestId }, "Removing a request from the queue");
        delete this.RequestQueue[requestId];
    }
    public respondToRequest(response: CmsMessageResponse) {
        rl.info({ requestId: response.requestId }, "Responding to a request");
        let parsedReqResponse: CmsRequestResponse;
        let returnCode = response.returnCode;
        try {
            parsedReqResponse = CmsRequestResponse.parse({
                error: response.error || "",
                data: response.data,
                status: response.status
            });
            this.getRequest(response.requestId).res.status(returnCode).json(parsedReqResponse);
        } catch (error) {
            rl.error({ response, requestId: response.requestId }, `Failed to respond to a request, passing an error to the client: ${String(error)}`);
            parsedReqResponse = {
                error: String(error),
                data: null,
                status: false
            };
            returnCode = 500;
        }
        this.removeRequest(response.requestId);
    }

    private connectRouterWithSocket(socketPoolEntry: SocketPoolEntry): void {
        const expressMethods = this.expressMethods;
        socketPoolEntry.interface.forEach((routeMapping) => {
            ml.trace({ routeMapping }, `Creating a route mapping for service ${socketPoolEntry.serviceId}`);
            try {
                const foundExpressMethodName = Object.keys(expressMethods).find(expressMethodName => routeMapping.method === expressMethodName) || "get";
    
                const routeName = `/api${routeMapping.route}`.replace(/([^:]\/)\/+/g, "$1");
                this.router[foundExpressMethodName as keyof typeof expressMethods](routeName, (req, res) => {
                    const requestId = randomUUID();
                    // TODO: add user info to the log message
                    rl.info({ routeMapping, requestId, routeName }, `A new request to service ${socketPoolEntry.servicePort}, route: ${routeName}, event: ${routeMapping.eventName}`);
                    try {
                        const parsedRequest = 
                        this.passEventToService(socketPoolEntry.socket, routeMapping.eventName, req, requestId);
                        this.RequestQueue[requestId] = { res, requestId };
                    } catch (error) {
                        rl.error({ routeMapping, requestId, routeName }, `Failed to pass a request to the service socket: ${String(error)}`);
                    }
                });
            } catch (error) {
                ml.error({ routeMapping }, `Failed to create a route mapping for ${socketPoolEntry.serviceId}: ${String(error)}`);
                return;
            }
        });
    }
    private passEventToService(socket: Socket, eventName: string, req: Request, requestId: string): string {
        const payload = {
            user: {
                login: "test",
                group: "test"
            },
            body: req.body as unknown,
            params: req.params,
            query: req.query,
            requestId
        };
        rl.trace({ eventName, requestId, payload }, "Passing a request to the service socket");
        socket.emit(eventName, payload);
        return requestId;
    }
    private recreateExpressRouter(): void {
        this.router = Router();
    }
}