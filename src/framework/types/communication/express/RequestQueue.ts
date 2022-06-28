import { Response } from "express";

export interface RequestQueueEntry {
    res: Response,
    requestId: string
}
export interface RequestQueue { 
    [key: string]: RequestQueueEntry
}