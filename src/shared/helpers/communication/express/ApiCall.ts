"use strict";

import { Response } from "express";

import { ApiResultType, CmsRequestResponse } from "@cmsTypes/index";

import { sendError } from "./sendError";

class ApiCall <ReturnType> {
    public async performStandard(res: Response, crudFunction: () => Promise<ApiResultType<ReturnType>>): Promise<ApiResultType<ReturnType>> {
        return new Promise((resolve) => {
            crudFunction()
                .then((result:  ApiResultType<ReturnType>) => {
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
    }
}

export { ApiCall };