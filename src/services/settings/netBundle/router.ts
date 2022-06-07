"use strict";

import { CrudRoutes } from "../../../shared/types";

export const getRoutes = (routePrefix: string): CrudRoutes => {
    return {
        get: `${routePrefix}/netBundle/:id?`,
        search: `${routePrefix}/netBundle/search`,
        aggregate: `${routePrefix}/netBundle/aggregate`,
        add: `${routePrefix}/netBundle`,
        update: `${routePrefix}/netBundle/:id`,
        delete: `${routePrefix}/netBundle/:id`,
    } as CrudRoutes;
};