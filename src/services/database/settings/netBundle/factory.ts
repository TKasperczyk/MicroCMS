import * as dotObj from "dot-object";

import { TLooseObject } from "@framework/types/generic";
import { TFactory } from "@framework/types/service";

import { TNetBundle, requiredDefaults } from "./type";

export const createNetBundle: TFactory<TNetBundle> = (netBundle: TNetBundle, includeRequired = false): TNetBundle => {
    if (includeRequired) {
        const dottedNetBundle = dotObj.dot(netBundle) as TLooseObject;
        for (const key of Object.keys(requiredDefaults)) {
            if (!dottedNetBundle[key as keyof TNetBundle]) {
                dottedNetBundle[key as keyof TNetBundle] = requiredDefaults[key];
            }
        }
        netBundle = dotObj.object(dottedNetBundle) as TNetBundle;
    }
    return TNetBundle.parse(netBundle);
};