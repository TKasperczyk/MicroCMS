import { Response } from "express";

import { TApiResult } from "@framework/types/communication";
import { TCmsRequestResponse } from "@framework/types/communication/express";

import { sendError } from "./sendError";

export abstract class ApiCall <TReturn> {
    public async performStandard(res: Response, crudFunction: () => Promise<TApiResult<TReturn>>): Promise<TApiResult<TReturn>> {
        return new Promise((resolve) => {
            crudFunction()
                .then((result: TApiResult<TReturn>) => {
                    res.status(200).jsonp({
                        status: true,
                        data: result,
                        error: ""
                    } as TCmsRequestResponse);
                    resolve(result);
                })
                .catch((error: Error) => {
                    sendError(res, error.message, 500);
                    resolve(null);
                });
        });
    }
}