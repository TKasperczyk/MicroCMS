import { Response } from "express";

import { ApiResult } from "@framework/types/communication";
import { CmsRequestResponse } from "@framework/types/communication/express";

import { sendError } from "./sendError";

export class ApiCall <ReturnType> {
    public async performStandard(res: Response, crudFunction: () => Promise<ApiResult<ReturnType>>): Promise<ApiResult<ReturnType>> {
        return new Promise((resolve) => {
            crudFunction()
                .then((result: ApiResult<ReturnType>) => {
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