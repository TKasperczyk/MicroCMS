import { Router as Router, Request, Response, NextFunction } from "express";
import { Socket } from "socket.io-client";

import { appLogger, reqLogger } from "@framework";
import { getErrorMessage } from "@framework/helpers";
import { extractUserData } from "@framework/helpers/communication";

import { TMethods, TRequestQueue, TRequestQueueEntry, TCmsRequestResponse, TCmsRequest, TCmsPreRequest, TCmsRequestResponseOutput } from "@framework/types/communication/express";
import { TSocketPool, TSocketPoolEntry } from "@framework/types/communication/socket";

const ml = appLogger("routerManager");
const rl = reqLogger("routerManager");

type TCustomMiddlewareList = ((req: Request | TCmsPreRequest, res: Response, next: NextFunction) => void | Promise<void>)[];

export class RouterManager {
    constructor(customMiddlewareList: TCustomMiddlewareList = []) {
        this.router = Router();
        this.expressMethods = {
            get: typeof this.router.get,
            put: typeof this.router.put,
            post: typeof this.router.post,
            delete: typeof this.router.delete
        };
        this.requestQueue = {};
        this.customMiddlewareList = customMiddlewareList;
    }

    private expressMethods: TMethods;
    private router: Router;
    private requestQueue: TRequestQueue;
    
    public customMiddlewareList: TCustomMiddlewareList;

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
    public respondToRequest(cmsRequestResponse: TCmsRequestResponseOutput, requestId: string) {
        rl.info({ requestId }, "Responding to a request");
        try {
            this.getRequest(requestId).res.status(cmsRequestResponse.returnCode).json(cmsRequestResponse);
            this.removeRequest(requestId);
        } catch (error) {
            rl.error({ cmsRequestResponse, requestId }, `Failed to respond to a request: ${getErrorMessage(error)}`);
        }
    }

    private connectRouterWithSocket(socketPoolEntry: TSocketPoolEntry): void {
        const expressMethods = this.expressMethods;
        socketPoolEntry.interface.forEach((routeMapping) => {
            ml.trace({ routeMapping }, `Creating a route mapping for service ${socketPoolEntry.serviceId}`);
            try {
                const foundExpressMethodName = Object.keys(expressMethods).find(expressMethodName => routeMapping.method === expressMethodName) || "get";
    
                const routeName = `/api${routeMapping.route}`.replace(/([^:]\/)\/+/g, "$1");
                const middlewares: TCustomMiddlewareList = [
                    // Add serviceId
                    (req: TCmsPreRequest, res: Response, next: NextFunction) => { req.serviceId = socketPoolEntry.serviceId; next(); },
                    // Add custom middleware (e.g. reqCache)
                    ...this.customMiddlewareList
                ];

                const connectHandler = (req: TCmsPreRequest, res: Response, next: NextFunction) => {
                    if (!req.requestId || !req.cacheId || !req.serviceId) {
                        ml.error("Missing requestId, cacheId or serviceId in the incoming request! Check if both middlewares are installed.");
                        res.status(500).json(TCmsRequestResponse.parse({
                            error: "Internal error",
                            data: null,
                            status: false
                        }));
                        return next();
                    }
                    const { requestId, cacheId } = req;
                    // TODO: add user info to the log message
                    rl.info({ routeMapping, requestId, routeName, cacheId }, `A new request to service ${socketPoolEntry.servicePort}, route: ${routeName}, event: ${routeMapping.eventName}`);
                    try {
                        this.passEventToService(socketPoolEntry.socket, routeMapping.eventName, req as TCmsRequest);
                        this.requestQueue[requestId] = { res, requestId, cacheId, serviceId: socketPoolEntry.serviceId };
                        // DO NOT call the next function - it will be called once we get a response
                    } catch (error) {
                        rl.error({ routeMapping, requestId, routeName, cacheId }, `Failed to pass a request to the service socket: ${getErrorMessage(error)}`);
                        return next();
                    }
                };
                
                this.router[foundExpressMethodName as keyof typeof expressMethods](routeName, [...middlewares, connectHandler]);
            } catch (error) {
                ml.error({ routeMapping }, `Failed to create a route mapping for ${socketPoolEntry.serviceId}: ${getErrorMessage(error)}`);
                return;
            }
        });
    }
    private passEventToService(socket: Socket, eventName: string, req: TCmsRequest): void {
        const payload = {
            user: req.user,
            body: req.body as unknown,
            params: req.params,
            query: req.query,
            requestId: req.requestId,
            cacheId: req.cacheId
        };
        rl.trace({ eventName, requestId: req.requestId, payload: { ...payload, user: extractUserData(payload) } }, "Passing a request to the service socket");
        socket.emit(eventName, payload);
    }
    private recreateExpressRouter(): void {
        this.router = Router();
    }
}