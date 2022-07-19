import { NextFunction, Request, Response } from "express";
import { createClient, RedisClientType } from "redis";
import { setIntervalAsync } from "set-interval-async/dynamic";

import { getErrorMessage } from "@framework/helpers";
import { extractUserData } from "@framework/helpers/communication";
import { appLogger, reqLogger } from "@framework/logger";
import { RouterManager } from "src/server/RouterManager";

import { TCmsRequest, TCmsRequestResponse } from "@framework/types/communication/express";
import { TLooseObject } from "@framework/types/generic";

const ml = appLogger("reqCache");
const rl = reqLogger("reqCache");

export class ReqCache {
    constructor(routerManager: RouterManager, dbId = 1) {
        this.redisClient = createClient();
        this.dbId = dbId;
        this.initDone = false;
        this.initCalled = false;

        this.routerManager = routerManager;
        this.dataToSave = [];
        this.dataToInvalidate = [];
        this.saveMethods = ["get"];
        this.invalidateMethods = ["put", "post", "delete"];

        this.runRedisSync();
    }
    private dbId: number;
    private redisClient: RedisClientType;
    private dataToSave: { cmsRequestResponse: TCmsRequestResponse, cacheId: string, namespace: string }[];
    private dataToInvalidate: { namespace: string }[];
    private initDone: boolean;
    private initCalled: boolean;
    private routerManager: RouterManager;
    private saveMethods: string[];
    private invalidateMethods: string[];

    public async middleware(req: Request, res: Response, next: NextFunction): Promise<void> {
        const cmsRequest = req as TCmsRequest;
        rl.trace({ requestId: cmsRequest.requestId, cacheId: cmsRequest.cacheId, serviceId: cmsRequest.serviceId, user: extractUserData(cmsRequest), req: { method: cmsRequest.method, path: cmsRequest.path, params: cmsRequest.params, query: cmsRequest.query } }, "Incoming request");
        const methodName = cmsRequest.method.toLowerCase();
        //Save to cache if necessary
        const responded = await this.middlewareGetHandler(cmsRequest, methodName, res);
        //Invalidate cache if necessary
        this.middlewareInvalidateHandler(cmsRequest, methodName);
        if (!responded) {
            next();
        }
    }

    public static createHash(expressMethodName: string, login: string | undefined, params: TLooseObject, query: TLooseObject): string {
        const buffer = Buffer.from(`${expressMethodName}${login ? login : ""}${JSON.stringify(query)}${JSON.stringify(params)}`);
        return buffer.toString("base64");
    }

    public save(cmsRequestResponse: TCmsRequestResponse, requestId: string): void {
        const { cacheId, serviceId } = this.routerManager.getRequest(requestId);
        if (!cacheId || this.dataToSave.find(entry => entry.cacheId === cacheId)) {
            return;
        }
        rl.trace({ requestId, cacheId, serviceId }, "Saving a request result to cache");
        this.dataToSave.push({ cacheId, cmsRequestResponse, namespace: serviceId });
    }
    public invalidate(namespace: string): void {
        if (!namespace) {
            return;
        }
        rl.trace({ namespace }, `Invalidating cache for ${namespace}`);
        this.dataToInvalidate.push({ namespace });
    }
    public async get(cacheId: string, namespace: string): Promise<TLooseObject> {
        if (!this.initCalled) {
            await this.init();
        }
        const result = (await this.redisClient.hGet(namespace, cacheId)) as string;
        return JSON.parse(result) as TLooseObject;
    }
    public async init(): Promise<void> {
        this.initCalled = true;
        await this.redisClient.connect();
        await this.redisClient.select(this.dbId);
        await this.redisClient.flushDb();
        this.initDone = true;
    }

    private middlewareInvalidateHandler(cmsRequest: TCmsRequest, methodName: string): boolean {
        if (!this.invalidateMethods.includes(methodName)) {
            return false;
        }
        try {
            this.invalidate(cmsRequest.serviceId);
            return true;
        } catch (error) {
            ml.error({ methodName }, `Failed to invalidate cache for ${cmsRequest?.serviceId}: ${getErrorMessage(error)}`);
        }
        return false;
    }
    private async middlewareGetHandler(cmsRequest: TCmsRequest, methodName: string, res: Response): Promise<boolean> {
        if (!this.saveMethods.includes(methodName)) {
            rl.trace({ requestId: cmsRequest.requestId, methodName }, "Passing - uncachable express method");
            return false;
        }
        const result = await this.get(cmsRequest.cacheId, cmsRequest.serviceId);
        if (!result) {
            rl.trace({ requestId: cmsRequest.requestId }, "Passing - not found in cache");
            return false;
        }
        try {
            const cmsRequestResponse = TCmsRequestResponse.parse({ ...result, fromCache: true });
            res.status(200).json(cmsRequestResponse);
            rl.trace({ requestId: cmsRequest.requestId }, "Provided a response from cache");
            return true;
        } catch (error) {
            ml.error({ result }, `Failed to convert a cache object to a CmsRequestResponse: ${getErrorMessage(error)}`);
        }
        return false;
    }
    private runRedisSync() {
        setIntervalAsync(async () => {
            if (!this.initCalled) {
                await this.init();
            }
            
            for (const entry of this.dataToSave) {
                await this.redisClient.hSet(entry.namespace, entry.cacheId, JSON.stringify(entry.cmsRequestResponse));
            }
            this.dataToSave = [];

            for (const entry of this.dataToInvalidate) {
                await this.redisClient.del(entry.namespace);
            }
            this.dataToInvalidate = [];
        }, 1000);
    }
}