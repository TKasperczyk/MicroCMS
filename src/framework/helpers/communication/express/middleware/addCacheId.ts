import { Response, NextFunction } from "express";

import { ReqCache } from "@framework/core/cache";

import { TCmsPreRequest } from "@framework/types/communication/express";

export const addCacheId = (req: TCmsPreRequest, res: Response, next: NextFunction): void => {
    req.cacheId = req.cacheId ? req.cacheId : ReqCache.createHash(req.method.toLowerCase(), req.user?.login, req.params, req.query);
    next();
};