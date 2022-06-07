"use strict";

import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { Crud } from "../../database/mongo";
import { CrudRoutes, LooseObject, CmsRequest } from "../../types";

class ApiCall <ReturnType, CrudType> {
    constructor() {};
    public async performStandard(
        req: CmsRequest, res: Response, next: NextFunction,
        crudFunction: () => any): Promise<ReturnType | Error>
    {
        return new Promise((resolve, reject) => {
            crudFunction()
                .then((result: ReturnType) => {
                    res.status(200).jsonp({
                        status: true,
                        data: result,
                        error: null
                    });
                    resolve(result);
                })
                .catch((error: Error) => {
                    res.status(500).jsonp({
                        status: false,
                        data: null,
                        error: error.message
                    });
                    resolve(error);
                });
        });
    };
};

export { ApiCall };