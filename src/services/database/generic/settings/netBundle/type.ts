import { ObjectId } from "mongodb";
import { z } from "zod";

import { TServiceType } from "@framework/types/enums";
import { TRequiredDefaults } from "@framework/types/service";

export const TNetBundle = z.object({
    _id: z.instanceof(ObjectId).optional(),
    name: z.string(),
    upMbps: z.number().default(0),
    downMbps: z.number().default(0),
    availableForService: TServiceType.default("net"),
    netPrice: z.number().default(0),
    indefinitePrice: z.number().default(0),
    installationIndefinitePrice: z.number().default(0),
    tvPrice: z.number().default(0),
    availableForConnectionTypeName: z.string().default("GPON"),
    tvBundleName: z.string().default(""),
    business: z.preprocess((val) => (typeof val === "boolean" || val === 0 || val === 1 ? Boolean(val) : val), z.boolean()).default(false)
}).strict();
export type TNetBundle = z.input<typeof TNetBundle>;

export const netBundleRequiredDefaults: TRequiredDefaults = {
    "name": ""
};