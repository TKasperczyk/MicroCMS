import { ObjectId } from "mongodb";
import { z } from "zod";

import { TRequiredDefaults, TUpdateSpec } from "@framework/types/service";

export const TSettings_NetBundle = z.object({
    _id: z.instanceof(ObjectId).optional(),
    name: z.string(),
    upMbps: z.number().default(0),
    downMbps: z.number().default(0),
    availableForService: z.enum(["net"]).default("net"),
    netPrice: z.number().default(0),
    indefinitePrice: z.number().default(0),
    installationIndefinitePrice: z.number().default(0),
    tvPrice: z.number().default(0),
    availableForConnectionTypeName: z.string().default("GPON"),
    tvBundleName: z.string().default(""),
    business: z.preprocess((val) => (typeof val === "boolean" || val === 0 || val === 1 ? Boolean(val) : val), z.boolean()).default(false)
}).strict();
export type TSettings_NetBundle = z.input<typeof TSettings_NetBundle>;

export const settings_netBundleRequiredDefaults: TRequiredDefaults = {
    "name": ""
};

export const settings_netBundleUpdateSpecs: TUpdateSpec[] = [];