"use strict";

import { CmsRequest } from "../../../types";
import { Request, Response, NextFunction } from "express";
import { sendError } from "./sendError";
import { IncomingParser } from "../IncomingParser";

export class ReqParser extends IncomingParser {
    private extractCrudMethodNameFromReq(req: Request): string {
        let crudMethodName: string = "";
        switch(req.method.toLowerCase()) {
            case "get": {
                if(/search/.test(req.originalUrl)) {
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
    };
    public parseReq(req: CmsRequest): CmsRequest {
        req.parsedQuery = this.parseQuery(req.query);
        req.parsedBody = this.parseBody(req.body);
        req.parsedParams = this.parseParams(req.params);

        if (this.crudRequiredArgsEnabled) {
            const crudMethodName = this.extractCrudMethodNameFromReq(req);
            if (crudMethodName && !this.checkCrudRequiredArgs(req, crudMethodName)){
                throw new Error(`Incomplete or incorrect arguments in the incoming request: ${this.lastError}`);
            }
        }
        return req;
    };
};