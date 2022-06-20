import { NextFunction, Request, Response } from "express";

import { IncomingParser } from "@framework/helpers/communication/IncomingParser";

import { CmsRequest } from "@framework/types/communication/express";
import { CrudOperations } from "@framework/types/database";
import { LooseObject } from "@framework/types/generic";

import { sendError } from "./sendError";

export class ReqParser extends IncomingParser {
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
            this.parseReq(req as CmsRequest);
            next();
        } catch (error) {
            sendError(res, String(error), 400);
        }
    }
    public parseReq(req: CmsRequest): CmsRequest {
        req.parsedQuery = this.parseQuery(req.query as string | LooseObject);
        req.parsedBody = this.parseBody(req.body as string | LooseObject);
        req.parsedParams = this.parseParams(req.params as string | LooseObject);

        if (this.crudRequiredArgsEnabled) {
            const crudMethodName = this.extractCrudMethodNameFromReq(req);
            if (crudMethodName && !this.checkCrudRequiredArgs(req, crudMethodName as keyof CrudOperations)) {
                throw new Error(`Incomplete or incorrect arguments in the incoming request: ${this.lastError}`);
            }
        }
        return req;
    }
}