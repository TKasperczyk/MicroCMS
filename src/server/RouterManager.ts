import { Router as Router, Request, Response, NextFunction } from "express";
import { Socket } from "socket.io-client";

import { appLogger, reqLogger } from "@framework";
import { getErrorMessage } from "@framework/helpers";

import { TMethods, TRequestQueue, TRequestQueueEntry, TCmsRequestResponse, TCmsRequest, TCmsPreRequest } from "@framework/types/communication/express";
import { TSocketPool, TSocketPoolEntry, TCmsMessageResponse } from "@framework/types/communication/socket";

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
        this.requestQueue = {};
    }

    private expressMethods: TMethods;
    private router: Router;
    private requestQueue: TRequestQueue;

    public middleware(req: Request, res: Response, next: NextFunction): void {
        return this.router(req, res, next);
    }
    public replace(socketPool: TSocketPool): void {
        ml.info(`Replacing the express router. There are ${Object.keys(socketPool).length} sockets in the pool`);
        this.recreateExpressRouter();
    
        for (const serviceId of Object.keys(socketPool)) {
            const socketPoolEntry = socketPool[serviceId as keyof TSocketPool];
            ml.debug(`Connecting ${serviceId} with express`);
            try {
                this.connectRouterWithSocket(socketPoolEntry);
            } catch (error) {
                ml.error({ socketPoolEntry }, `Couldn't connect a socket interface with an express route: ${getErrorMessage(error)}`);
                return;
            }
        }

        const expressMethods = this.expressMethods;
        for (const methodName of Object.keys(expressMethods)) {
            this.router[methodName as keyof typeof expressMethods]("*", (req, res) => {
                rl.debug(`Unknown route: ${req.originalUrl} . Returning 404`);
                res.status(404).json(TCmsRequestResponse.parse({
                    error: "Not found",
                    data: null,
                    status: false
                }));
            });
        }
    }
    public getRequest(requestId: string): TRequestQueueEntry {
        if (!this.requestQueue[requestId]) {
            throw new Error(`Asking for an unknown request for request ${requestId}`);
        }
        return this.requestQueue[requestId as keyof TRequestQueue];
    }
    public removeRequest(requestId: string): void {
        rl.trace({ requestId }, "Removing a request from the queue");
        delete this.requestQueue[requestId];
    }
    public respondToRequest(response: TCmsMessageResponse) {
        rl.info({ requestId: response.requestId }, "Responding to a request");
        let parsedReqResponse: TCmsRequestResponse;
        let returnCode = response.returnCode;
        try {
            parsedReqResponse = TCmsRequestResponse.parse({
                error: response.error || "",
                data: response.data,
                status: response.status
            });
            this.getRequest(response.requestId).res.status(returnCode).json(parsedReqResponse);
        } catch (error) {
            rl.error({ response, requestId: response.requestId }, `Failed to respond to a request, passing an error to the client: ${getErrorMessage(error)}`);
            parsedReqResponse = {
                error: String(error),
                data: null,
                status: false
            };
            returnCode = 500;
        }
        this.removeRequest(response.requestId);
    }

    private connectRouterWithSocket(socketPoolEntry: TSocketPoolEntry): void {
        const expressMethods = this.expressMethods;
        socketPoolEntry.interface.forEach((routeMapping) => {
            ml.trace({ routeMapping }, `Creating a route mapping for service ${socketPoolEntry.serviceId}`);
            try {
                const foundExpressMethodName = Object.keys(expressMethods).find(expressMethodName => routeMapping.method === expressMethodName) || "get";
    
                const routeName = `/api${routeMapping.route}`.replace(/([^:]\/)\/+/g, "$1");
                this.router[foundExpressMethodName as keyof typeof expressMethods](routeName, (req: TCmsPreRequest, res) => {
                    if (!req.requestId || !req.cacheId) {
                        ml.error("Missing requestId or cacheId in the incoming request! Check if both middlewares are installed.");
                        res.status(500).json(TCmsRequestResponse.parse({
                            error: "Internal error",
                            data: null,
                            status: false
                        }));
                        return;
                    }
                    const { requestId, cacheId } = req;
                    // TODO: add user info to the log message
                    rl.info({ routeMapping, requestId, routeName }, `A new request to service ${socketPoolEntry.servicePort}, route: ${routeName}, event: ${routeMapping.eventName}`);
                    try {
                        this.passEventToService(socketPoolEntry.socket, routeMapping.eventName, req as TCmsRequest);
                        this.requestQueue[requestId] = { res, requestId, cacheId };
                    } catch (error) {
                        rl.error({ routeMapping, requestId, routeName }, `Failed to pass a request to the service socket: ${getErrorMessage(error)}`);
                    }
                });
            } catch (error) {
                ml.error({ routeMapping }, `Failed to create a route mapping for ${socketPoolEntry.serviceId}: ${getErrorMessage(error)}`);
                return;
            }
        });
    }
    private passEventToService(socket: Socket, eventName: string, req: TCmsRequest): void {
        const payload = {
            user: {
                login: "test",
                group: "testGroup"
            },
            body: req.body as unknown,
            params: req.params,
            query: req.query,
            requestId: req.requestId,
            cacheId: req.cacheId
        };
        rl.trace({ eventName, requestId: req.requestId, payload }, "Passing a request to the service socket");
        socket.emit(eventName, payload);
    }
    private recreateExpressRouter(): void {
        this.router = Router();
    }
}