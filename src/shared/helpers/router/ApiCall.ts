"use strict";

import { z } from "zod";
import { Crud } from "../../database/mongo";
import { CrudRoutes, LooseObject } from "../../types/index";

class ApiCall <ReturnType> {
    constructor() {};
    public async perform(crudInstance: Crud<ReturnType>, crudFunction: keyof CrudRoutes, args: any[]): Promise<ReturnType> {
        return crudInstance[crudFunction].bind(crudInstance, args);
    };
};

export { ApiCall };