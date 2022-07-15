import { NextFunction, Request, Response } from "express";

import { IncomingParser } from "@framework/core/communication/IncomingParser";
import { sendError } from "@framework/helpers/communication/express/sendError";

import { TCmsRequest } from "@framework/types/communication/express";
import { TLooseObject } from "@framework/types/generic";

export abstract class ReqParser extends IncomingParser {
    public middleware(req: Request, res: Response, next: NextFunction): void {
        try {
            //this.parseReq(req);
            next();
        } catch (error) {
            sendError(res, String(error), 400);
        }
    }
}