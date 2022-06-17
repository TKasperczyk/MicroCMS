"use strict";

import { CrudRoutes } from "@cmsTypes/index";

export const getRoutes = (routePrefix: string): CrudRoutes => {
    return {
        search: `${routePrefix}/netBundle/search`,
        aggregate: `${routePrefix}/netBundle/aggregate`,
        get: `${routePrefix}/netBundle/:id?`,
        add: `${routePrefix}/netBundle`,
        update: `${routePrefix}/netBundle/:id`,
        delete: `${routePrefix}/netBundle/:id`,
    } as CrudRoutes;
};