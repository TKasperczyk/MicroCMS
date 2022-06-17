"use strict";

import { LooseObject } from "@cmsTypes/index";

export const optionalParse = (input: LooseObject | string): LooseObject => {
    const result: LooseObject = {};
    try {
        if (typeof input === "string"){
            return JSON.parse(input);
        } else if (typeof input === "object"){
            let parsedAtLeastOne = false;
            for (const key in input){
                if (typeof input[key] === "string") {
                    try {
                        result[key] = JSON.parse(input[key]);
                        parsedAtLeastOne = true;
                    } catch (error) { }
                }
            }
            if (parsedAtLeastOne){
                return result;
            } else {
                return input;
            }
        }
    } catch (error) {
        const errorMessage = `Error while parsing an object: ${error}`;
        throw new Error(errorMessage);
    }
    return result;
};