import { LooseObject } from "@framework/types/generic";

export const optionalParse = (input: LooseObject | string): LooseObject => {
    const result: LooseObject = {};
    try {
        if (typeof input === "string") {
            return JSON.parse(input) as LooseObject;
        } else if (typeof input === "object") {
            let parsedAtLeastOne = false;
            for (const key in input) {
                if (typeof input[key] === "string") {
                    try {
                        result[key] = JSON.parse(input[key] as string) as LooseObject;
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
        const errorMessage = `Error while parsing an object: ${String(error)}`;
        throw new Error(errorMessage);
    }
    return result;
};