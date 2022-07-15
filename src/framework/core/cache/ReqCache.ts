import { createHash } from "node:crypto";

import { NextFunction, Request, Response } from "express";
import { createClient, RedisClientType } from "redis";

import { TCmsRequest, TRequestQueue, TRequestQueueEntry } from "@framework/types/communication/express";
import { TCmsMessageResponse } from "@framework/types/communication/socket";
import { TLooseObject } from "@framework/types/generic";

export class ReqCache {
    constructor(getRequest: (requestId: string) => TRequestQueueEntry, dbId = 1) {
        this.redisClient = createClient();
        this.savedHashes = [];
        this.dbId = dbId;
        this.initDone = false;

        this.namespace = "ReqCache";
        this.getRequest = getRequest;
    }
    private dbId: number;
    private redisClient: RedisClientType;
    private savedHashes: string[];
    private initDone: boolean;
    private namespace: string;
    private getRequest: (requestId: string) => TRequestQueueEntry;

    public async middleware(req: Request, res: Response, next: NextFunction): Promise<void> {
        const cmsRequest = req as TCmsRequest;
        const result = await this.getFromCache(cmsRequest.method.toLowerCase());
        console.log("CACHE: ", result);
        next();
    }

    public static createHash(expressMethodName: string, params: TLooseObject, query: TLooseObject): string {
        const buffer = new Buffer(`${expressMethodName}${JSON.stringify(query)}${JSON.stringify(params)}`);
        return buffer.toString("base64");
    }

    public async saveToCache(response: TCmsMessageResponse): Promise<boolean> {
        const cacheId = this.getRequest(response.requestId).cacheId;
        if (this.savedHashes.includes(cacheId)) {
            return false;
        }
        if (!this.initDone) {
            await this.init();
        }
        await this.redisClient.hSet(this.namespace, cacheId, JSON.stringify(response));
        return true;
    }
    public async getFromCache(cacheId: string): Promise<TLooseObject> {
        if (!this.initDone) {
            await this.init();
        }
        const result = (await this.redisClient.hGet(this.namespace, cacheId)) as string;
        return JSON.parse(result) as TLooseObject;
    }
    public async init(): Promise<void> {
        await this.redisClient.select(this.dbId);
        await this.redisClient.flushDb();
        this.initDone = true;
    }
}