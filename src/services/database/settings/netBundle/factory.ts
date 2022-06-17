"use strict";

import * as dotObj from "dot-object";

import { ServiceFactory } from "@cmsTypes/index";

import { NetBundle, requiredDefaults } from "./type";

export const createNetBundle: ServiceFactory<NetBundle> = (netBundle: NetBundle, includeRequired = false): NetBundle => {
    if (includeRequired){
        const dottedNetBundle = dotObj.dot(netBundle);
        for (const key of Object.keys(requiredDefaults)){
            if (!dottedNetBundle[key as keyof NetBundle]){
                dottedNetBundle[key as keyof NetBundle] = requiredDefaults[key];
            }
        }
        netBundle = dotObj.object(dottedNetBundle) as NetBundle;
    }
    return NetBundle.parse(netBundle);
};