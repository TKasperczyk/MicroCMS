"use strict";

import { Express } from "express";
import bodyParser from "body-parser";

export const addMiddleware = (app: Express): void => {
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
};