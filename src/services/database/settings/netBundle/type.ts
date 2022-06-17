"use strict";

import { z } from "zod";

import { ObjectId } from "@cmsDatabase/mongo";
import { ServiceType } from "@cmsTypes/enums";

export const NetBundle = z.object({
    _id: z.instanceof(ObjectId).optional(),
    name: z.string(),
    upMbps: z.number().default(0),
    downMbps: z.number().default(0),
    availableForService: ServiceType.default("net"),
    netPrice: z.number().default(0),
    indefinitePrice: z.number().default(0),
    installationIndefinitePrice: z.number().default(0),
    tvPrice: z.number().default(0),
    availableForConnectionTypeName: z.string().default("GPON"),
    tvBundleName: z.string().default(""),
    business: z.preprocess((val) => (typeof val === "boolean" || val === 0 || val === 1 ? Boolean(val) : val), z.boolean()).default(false)
}).strict();
export type NetBundle = z.infer<typeof NetBundle>;

export const requiredDefaults: {[key: string]: any} = {
    "name": ""
};