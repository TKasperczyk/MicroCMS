"use strict";

import { Request } from "express";
export * as enums from "./enums";
export * as errors from "./errors";

export interface LooseObject {
    [key: string]: any
};
export interface StringObject {
    [key: string]: string
};

export interface CmsRequest extends Request { parsedQuery: LooseObject, parsedBody: LooseObject, parsedParams: LooseObject };
export interface CmsRequestResponse { status: boolean, data: any, error: string };
export interface CmsMessage { parsedQuery: LooseObject, parsedBody: LooseObject, parsedParams: LooseObject, id: string, error: CmsMessageResponse, user: LooseObject, authorizer: AuthorizeMapEntry };
export interface CmsMessageResponse { status: boolean, data: any, error: string, id: string, returnCode: number };

export interface CrudRoutes {
    get: any,
    search: any,
    aggregate: any,
    add: any,
    update: any,
    delete: any
};
export interface ParsedReqArgs {
    params: LooseObject,
    query: LooseObject,
    body: LooseObject
};

export interface AuthorizeMapEntry {
    hiddenReadFields: string[],
    forbiddenWriteFields: string[],
    forbiddenOperations: string[]
};

export type ServiceFactory<ReturnType> = (input: ReturnType, includeRequired?: boolean) => ReturnType;

export interface AuthorizeMap {
    user: {
        [key: string]: AuthorizeMapEntry
    },
    group: {
        [key: string]: AuthorizeMapEntry
    }
};

export interface PacketData {
    msg: CmsMessage,
    eventName: string
};