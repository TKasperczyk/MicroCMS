"use strict";

import { CrudOperations } from "@framework/types/database";

export const getRoutes = (routePrefix: string): CrudOperations => {
    return {
        search: `${routePrefix}/netBundle/search`,
        aggregate: `${routePrefix}/netBundle/aggregate`,
        get: `${routePrefix}/netBundle/:id?`,
        add: `${routePrefix}/netBundle`,
        update: `${routePrefix}/netBundle/:id`,
        delete: `${routePrefix}/netBundle/:id`,
    } as CrudOperations;
};