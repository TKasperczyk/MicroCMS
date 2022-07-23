import { Router, Request, Response, NextFunction } from "express";
import { Socket } from "socket.io-client";

import { appLogger, reqLogger } from "@framework";
import { getErrorMessage } from "@framework/helpers";
import { extractUserData } from "@framework/helpers/communication";

import { TMethods, TRequestQueue, TRequestQueueEntry, TCmsRequestResponse, TCmsRequest, TCmsPreRequest, TCmsRequestResponseOutput } from "@framework/types/communication/express";
import { TSocketPoolEntry } from "@framework/types/communication/socket";

const ml = appLogger("routerManager");
const rl = reqLogger("routerManager");

type TCustomMiddlewareList = ((req: Request | TCmsPreRequest, res: Response, next: NextFunction) => void | Promise<void>)[];

type TGetSocketPoolEntry = (serviceId: string) => TSocketPoolEntry | null;

export class RouterManager {
    constructor(getSocketPoolEntry: TGetSocketPoolEntry, customMiddlewareList: TCustomMiddlewareList = []) {
        this.router = Router();
        this.expressMethods = {
            get: typeof this.router.get,
            put: typeof this.router.put,
            post: typeof this.router.post,
            delete: typeof this.router.delete
        };
        this.requestQueue = {};
        this.customMiddlewareList = customMiddlewareList;
        this.getSocketPoolEntry = getSocketPoolEntry;

        this.router = Router();
    }

    private expressMethods: TMethods;
    private router: Router;
    private requestQueue: TRequestQueue;
    private getSocketPoolEntry: TGetSocketPoolEntry;

    public customMiddlewareList: TCustomMiddlewareList;

    public middleware(req: Request, res: Response, next: NextFunction): void {
        return this.router(req, res, next);
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

    public addServiceRoutes(serviceId: string): void {
        const expressMethods = this.expressMethods;
        this.getSocketPoolEntry(serviceId)?.interface.forEach((routeMapping) => {
            ml.trace({ routeMapping }, `Creating a route mapping for service ${serviceId}`);
            try {
                const foundExpressMethodName = Object.keys(expressMethods).find(expressMethodName => routeMapping.method === expressMethodName) || "get";
    
                const routeName = this.getFullRouteName(routeMapping.route);
                const middlewares: TCustomMiddlewareList = [
                    // Add serviceId
                    (req: TCmsPreRequest, res: Response, next: NextFunction) => { req.serviceId = serviceId; next(); },
                    // Add custom middleware (e.g. reqCache)
                    ...this.customMiddlewareList
                ];

                const connectHandler = (req: TCmsPreRequest, res: Response) => {
                    try {
                        const socketPoolEntry = this.getSocketPoolEntry(serviceId);
                        if (!socketPoolEntry) {
                            throw new Error("The service is down!");
                        }
                        if (!req.requestId || !req.cacheId || !req.serviceId) {
                            throw new Error("Missing requestId, cacheId or serviceId in the incoming request! Check if both middlewares are installed.");
                        }
                        // TODO: add user info to the log message
                        rl.info({ routeMapping, requestId: req.requestId, routeName, cacheId: req.cacheId }, `A new request to service ${String(this.getSocketPoolEntry(serviceId)?.servicePort)}, route: ${routeName}, event: ${routeMapping.eventName}`);
                        this.passEventToService(socketPoolEntry.socket, routeMapping.eventName, req as TCmsRequest);
                        this.requestQueue[req.requestId] = { res, requestId: req.requestId, cacheId: req.cacheId, serviceId: serviceId };
                        // DO NOT call the next function - it will be called once we get a response
                    } catch (error) {
                        const errorMsg = `Failed to pass a request to the service socket: ${getErrorMessage(error)}`;
                        rl.error({ routeMapping, requestId: req.requestId, routeName, cacheId: req.cacheId }, errorMsg);
                        this.passInternalError(res, errorMsg);
                        return;
                    }
                };
                
                this.router[foundExpressMethodName as keyof typeof expressMethods](routeName, [...middlewares, connectHandler]);
            } catch (error) {
                ml.error({ routeMapping }, `Failed to create a route mapping for ${serviceId}: ${getErrorMessage(error)}`);
                return;
            }
        });
    }
    /* TODO */
    public removeServiceRoutes(serviceId: string): void { //eslint-disable-line 
        return;
    }

    private passInternalError(res: Response, errorMsg: string): void {
        res.status(500).json(TCmsRequestResponse.parse({
            error: errorMsg,
            data: null,
            status: false,
            returnCode: 500
        }));
    }
    private getFullRouteName(route: string) {
        return `/api${route}`.replace(/([^:]\/)\/+/g, "$1");
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
}