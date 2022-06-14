"use strict";

import { Response } from "express";
import { sendError } from "./sendError";
import { CmsRequestResponse } from "../../../types";

class ApiCall <ReturnType> {
    constructor() {};
    public async performStandard(res: Response, crudFunction: () => any): Promise<ReturnType | null> {
        return new Promise((resolve, reject) => {
            crudFunction()
                .then((result: ReturnType) => {
                    res.status(200).jsonp({
                        status: true,
                        data: result,
                        error: ""
                    } as CmsRequestResponse);
                    resolve(result);
                })
                .catch((error: Error) => {
                    sendError(res, error.message, 500);
                    resolve(null);
                });
        });
    };
};

export { ApiCall };