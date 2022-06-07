"use strict";

import express, { Express, Request, Response, NextFunction } from "express";

import { getRoutes } from "./router";
import { NetBundleType } from "./type";
import { netBundleCrud, NetBundleCrud } from "./crud";
import { addGlobalMiddleware, getCrudMiddleware } from "./middleware";
import { parseRequest } from "./parser";
import { CmsRequest } from "../../../shared/types";
import { ApiCall } from "../../../shared/helpers/router";

const netBundle = express();
const routes = getRoutes("/api/settings");

addGlobalMiddleware(netBundle);
netBundle.use(parseRequest);

const apiCall = new ApiCall<NetBundleType, NetBundleCrud>();

netBundleCrud.init().then(() => {
    // Get
    netBundle.get(routes.get, getCrudMiddleware("get").concat([(req: Request, res: Response, next: NextFunction): void => {
        const parsedReq = req as CmsRequest;
        apiCall.performStandard(parsedReq, res, next, netBundleCrud.get.bind(netBundleCrud, parsedReq.parsedParams!.id));
    }]));
    // Search
    netBundle.get(routes.search, getCrudMiddleware("search").concat([(req: Request, res: Response, next: NextFunction): void => {
        const parsedReq = req as CmsRequest;
        apiCall.performStandard(parsedReq, res, next, netBundleCrud.search.bind(netBundleCrud, parsedReq.parsedQuery!.query));
    }]));
    // Aggregate
    netBundle.get(routes.aggregate, getCrudMiddleware("aggregate").concat([(req: Request, res: Response, next: NextFunction): void => {
        const parsedReq = req as CmsRequest;
        apiCall.performStandard(parsedReq, res, next, netBundleCrud.aggregate.bind(netBundleCrud, parsedReq.parsedQuery!.pipeline));
    }]));
    // Add
    netBundle.post(routes.add, getCrudMiddleware("add").concat([(req: Request, res: Response, next: NextFunction): void => {
        const parsedReq = req as CmsRequest;
        apiCall.performStandard(parsedReq, res, next, netBundleCrud.add.bind(netBundleCrud, parsedReq.parsedBody!.netBundle));
    }]));
    // Update
    netBundle.put(routes.update, getCrudMiddleware("update").concat([(req: Request, res: Response, next: NextFunction): void => {
        const parsedReq = req as CmsRequest;
        apiCall.performStandard(parsedReq, res, next, netBundleCrud.update.bind(netBundleCrud, parsedReq.parsedParams!.id, parsedReq.parsedBody!.netBundle));
    }]));
    // Delete
    netBundle.delete(routes.delete, getCrudMiddleware("delete").concat([(req: Request, res: Response, next: NextFunction): void => {
        const parsedReq = req as CmsRequest;
        apiCall.performStandard(parsedReq, res, next, netBundleCrud.delete.bind(netBundleCrud, parsedReq.parsedBody!.netBundle));
    }]));
    netBundle.listen(3000);
});