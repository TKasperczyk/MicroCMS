import { isObject } from "@framework/helpers/assertions/isObject";
import { getErrorMessage } from "@framework/helpers/getErrorMessage";

import { TLooseObject } from "@framework/types/generic";

export const optionalDeepParse = (input: TLooseObject | string): TLooseObject => {
    const result: TLooseObject = {};
    try {
        if (typeof input === "string") {
            return JSON.parse(input) as TLooseObject;
        } else if (isObject(input)) {
            let parsedAtLeastOne = false;
            for (const key in input) {
                if (typeof input[key] === "string") {
                    try {
                        result[key] = JSON.parse(input[key] as string) as TLooseObject;
                        parsedAtLeastOne = true;
                    } catch (error) { } //eslint-disable-line no-empty
                }
            }
            if (parsedAtLeastOne) {
                return result;
            } else {
                return input;
            }
        }
    } catch (error) {
        const errorMessage = `Error while parsing an object: ${getErrorMessage(error)}`;
        throw new Error(errorMessage);
    }
    return result;
};