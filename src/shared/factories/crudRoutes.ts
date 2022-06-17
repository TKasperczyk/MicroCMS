"use strict";

import { CrudRoutes } from "@cmsTypes/index";

export const crudRoutesFactory = (): CrudRoutes => {
    return {
        get: null,
        search: null,
        aggregate: null,
        add: null,
        update: null,
        delete: null
    } as CrudRoutes;
};