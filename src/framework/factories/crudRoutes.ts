"use strict";

import { CrudOperations } from "@framework/types/database";

export const CrudOperationsFactory = (): CrudOperations => {
    return {
        get: null,
        search: null,
        aggregate: null,
        add: null,
        update: null,
        delete: null
    } as CrudOperations;
};