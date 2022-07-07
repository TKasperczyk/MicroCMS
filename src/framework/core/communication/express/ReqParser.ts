import { NextFunction, Request, Response } from "express";

import { IncomingParser } from "@framework/core/communication/IncomingParser";
import { sendError } from "@framework/helpers/communication/express/sendError";

import { TCmsRequest } from "@framework/types/communication/express";
import { TLooseObject } from "@framework/types/generic";

export abstract class ReqParser extends IncomingParser {
    private extractCrudMethodNameFromReq(req: Request): string {
        let crudMethodName = "";
        switch (req.method.toLowerCase()) {
            case "get": {
                if (/search/.test(req.originalUrl)) {
                    crudMethodName = "search";
                } else if (/aggregate/.test(req.originalUrl)) {
                    crudMethodName = "aggregate";
                } else {
                    crudMethodName = "get";
                }
                break;
            }
            case "post": {
                crudMethodName = "add";
                break;
            }
            case "put": {
                crudMethodName = "update";
                break;
            }
            case "delete": {
                crudMethodName = "delete";
                break;
            }
        }
        return crudMethodName;
    }

    public middleware(req: Request, res: Response, next: NextFunction): void {
        try {
            this.parseReq(req as TCmsRequest);
            next();
        } catch (error) {
            sendError(res, String(error), 400);
        }
    }
    public parseReq(req: TCmsRequest): TCmsRequest {
        req.parsedQuery = this.parseQuery(req.query as string | TLooseObject);
        req.parsedBody = this.parseBody(req.body as string | TLooseObject);
        req.parsedParams = this.parseParams(req.params as string | TLooseObject);

        if (this.crudRequiredArgsEnabled) {
            const crudMethodName = this.extractCrudMethodNameFromReq(req);
            if (crudMethodName && !this.checkCrudRequiredArgs(req, crudMethodName)) {
                throw new Error(`Incomplete or incorrect arguments in the incoming request: ${this.lastError}`);
            }
        }
        return req;
    }
}