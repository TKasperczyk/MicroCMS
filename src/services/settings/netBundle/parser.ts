"use strict";

import { NextFunction, Request, Response } from "express";
import { CmsRequest } from "../../../shared/types";

export const parseRequest = (req: Request, res: Response, next: NextFunction): void  => {
    const parsedReq = req as CmsRequest;
    parsedReq.parsedBody = req.body;
    parsedReq.parsedQuery = req.query;
    parsedReq.parsedParams = req.params;
    next();
};