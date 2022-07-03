import * as dotObj from "dot-object";

import { TLooseObject } from "@framework/types/generic";
import { TFactory } from "@framework/types/service";

import { NetBundle, requiredDefaults } from "./type";

export const createNetBundle: TFactory<NetBundle> = (netBundle: NetBundle, includeRequired = false): NetBundle => {
    if (includeRequired) {
        const dottedNetBundle = dotObj.dot(netBundle) as TLooseObject;
        for (const key of Object.keys(requiredDefaults)) {
            if (!dottedNetBundle[key as keyof NetBundle]) {
                dottedNetBundle[key as keyof NetBundle] = requiredDefaults[key];
            }
        }
        netBundle = dotObj.object(dottedNetBundle) as NetBundle;
    }
    return NetBundle.parse(netBundle);
};