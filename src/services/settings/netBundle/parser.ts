"use strict";

import { ParsedReqArgs, } from "../../../shared/types";

export const parseRequest = (req: any): ParsedReqArgs  => {
    return {
        params: req.params,
        query: req.query,
        body: req.body
    };
};