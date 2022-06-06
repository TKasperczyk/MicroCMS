"use strict";

export * as enums from "./enums";

export interface LooseObject {
    [key: string]: any
};

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