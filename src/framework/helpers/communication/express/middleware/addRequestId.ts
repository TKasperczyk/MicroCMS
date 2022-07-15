import { randomUUID } from "crypto";

import { Response, NextFunction } from "express";

import { TCmsPreRequest } from "@framework/types/communication/express";

export const addRequestId = (req: TCmsPreRequest, res: Response, next: NextFunction): void => {
    req.requestId = req.requestId ? req.requestId : randomUUID();
    next();
};