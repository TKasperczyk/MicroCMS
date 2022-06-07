"use strict";

import { Request, Response, NextFunction } from "express";
export * as enums from "./enums";

export interface LooseObject {
    [key: string]: any
};
export interface StringObject {
    [key: string]: string
};
export type MiddlewareFunction = (req: Request, res: Response, next: NextFunction) => void;
export interface CrudRoutes {
    get: any,
    search: any,
    aggregate: any,
    add: any,
    update: any,
    delete: any
};
export interface CmsMiddleware extends CrudRoutes {
    get: MiddlewareFunction[],
    search: MiddlewareFunction[],
    aggregate: MiddlewareFunction[],
    add: MiddlewareFunction[],
    update: MiddlewareFunction[],
    delete: MiddlewareFunction[]
};
export interface ParsedReqArgs {
    params: LooseObject,
    query: LooseObject,
    body: LooseObject
};

export type CmsRequest = Request & { parsedParams?: StringObject, parsedQuery: LooseObject, parsedBody: LooseObject };