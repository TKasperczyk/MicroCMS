import { Response } from "express";

import { TCmsRequestResponse } from "@framework/types/communication/express";

export const sendError = (res: Response, message: string, returnCode = 500) => {
    res.status(returnCode).jsonp({
        status: false,
        data: null,
        error: message
    } as TCmsRequestResponse);
};