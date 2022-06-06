"use strict";

import { Router, Request, Response, NextFunction } from "express";
import { netBundleCrud } from "./crud";
import { CrudRoutes } from "../../../shared/types";

export const getRouter = (routePrefix: string, middleware: string): Router => {

    const routes: CrudRoutes = {
        get: `${routePrefix}/netBundle/:id`,
        search: `${routePrefix}/netBundle/search`,
        aggregate: `${routePrefix}/netBundle/aggregate`,
        add: `${routePrefix}/netBundle`,
        update: `${routePrefix}/netBundle/:id`,
        delete: `${routePrefix}/netBundle/:id`,
    };
    const router = Router();
    return router;
};