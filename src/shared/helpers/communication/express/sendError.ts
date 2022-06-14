"use strict";

import { Response } from "express";
import { CmsRequestResponse } from "../../../types";

export const sendError = (res: Response, message: string, returnCode: number = 500) => {
    res.status(returnCode).jsonp({
        status: false,
        data: null,
        error: message
    } as CmsRequestResponse);
};