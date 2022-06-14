"use strict";

import { CrudRoutes } from "../types";

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