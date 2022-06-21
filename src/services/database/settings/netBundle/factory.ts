import * as dotObj from "dot-object";

//Test

import { LooseObject } from "@framework/types/generic";
import { Factory } from "@framework/types/service";

import { NetBundle, requiredDefaults } from "./type";

export const createNetBundle: Factory<NetBundle> = (netBundle: NetBundle, includeRequired = false): NetBundle => {
    if (includeRequired) {
        const dottedNetBundle = dotObj.dot(netBundle) as LooseObject;
        for (const key of Object.keys(requiredDefaults)) {
            if (!dottedNetBundle[key as keyof NetBundle]) {
                dottedNetBundle[key as keyof NetBundle] = requiredDefaults[key];
            }
        }
        netBundle = dotObj.object(dottedNetBundle) as NetBundle;
    }
    return NetBundle.parse(netBundle);
};