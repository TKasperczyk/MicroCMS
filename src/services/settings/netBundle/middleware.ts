"use strict";

import { Express, NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import { MiddlewareFunction } from "../../../shared/types";

export const addGlobalMiddleware = (app: Express): void => {
    app.use((req: Request, res: Response, next: NextFunction): void => {
        bodyParser.urlencoded({
            extended: true,
        })(req, res, (error): void => {
            if (error) {
                res.sendStatus(400);
                return;
            }
            next();
        });
    });
    app.use((req: Request, res: Response, next: NextFunction): void => {
        bodyParser.json()(req, res, (error): void => {
            if (error) {
                res.sendStatus(400);
                return;
            }
            next();
        });
    });
    app.use((req: Request, res: Response, next: NextFunction): void => {
        console.log(req.url);
        next();
    });
};

export const getCrudMiddleware = (crudMethodName: string): MiddlewareFunction[] => {
    const result: MiddlewareFunction[] = [];
    switch(crudMethodName) {
        case "get": {break;};
        case "search": {break;};
        case "aggregate": {break;};
        case "update": {break;};
        case "delete": {break;};
    };
    return result;
};