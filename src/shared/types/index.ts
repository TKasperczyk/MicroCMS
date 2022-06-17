"use strict";

import { Request } from "express";
import { Sort } from "mongodb";
export * as enums from "./enums";
export * as errors from "./errors";

export interface LooseObject {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    [key: string]: any
}
export interface StringObject {
    [key: string]: string
}

export interface CmsRequest extends Request { parsedQuery: LooseObject, parsedBody: LooseObject, parsedParams: LooseObject }
export interface CmsRequestResponse { status: boolean, data: LooseObject | LooseObject[] | null, error: string }
export interface CmsMessage { parsedQuery: LooseObject, parsedBody: LooseObject, parsedParams: LooseObject, id: string, error: CmsMessageResponse, user: LooseObject, authorizer: AuthorizeMapEntry }
export interface CmsMessageResponse { status: boolean, data: LooseObject | LooseObject[] | null, error: string, id: string, returnCode: number }

export type SocketNextFunction = (err?: Error | undefined) => void;

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CrudRoutes {
    get: any,
    search: any,
    aggregate: any,
    add: any,
    update: any,
    delete: any
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface CrudMongoSearchOptions {
    query: LooseObject, 
    sort: Sort, 
    page: number,
    pageSize: number, 
    limit: number
}

export interface ParsedReqArgs {
    params: LooseObject,
    query: LooseObject,
    body: LooseObject
}

export interface AuthorizeMapEntry {
    hiddenReadFields: string[],
    forbiddenWriteFields: string[],
    forbiddenOperations: string[]
}

export type ServiceFactory<ReturnType> = (input: ReturnType, includeRequired?: boolean) => ReturnType;
export type ApiResultType<ReturnType> = ReturnType | ReturnType[] | null | boolean;

export interface AuthorizeMap {
    user: {
        [key: string]: AuthorizeMapEntry
    },
    group: {
        [key: string]: AuthorizeMapEntry
    }
}

export interface PacketData {
    msg: CmsMessage,
    eventName: string
}