import { Response } from "express";

export interface TRequestQueueEntry {
    res: Response,
    requestId: string,
    cacheId: string
}
export interface TRequestQueue { 
    [key: string]: TRequestQueueEntry
}