import { ObjectId } from "mongodb";
import { z } from "zod";

import { TRequiredDefaults, TUpdateSpec } from "@framework/types/service";

export const TGeneric_Settings_Client_NetBundle = z.object({
    _id: z.instanceof(ObjectId).optional(),
    name: z.string().trim(),
    upMbps: z.number().default(0),
    downMbps: z.number().default(0),
    availableForService: z.enum(["net"]).default("net"),
    netPrice: z.number().default(0),
    indefinitePrice: z.number().default(0),
    installationIndefinitePrice: z.number().default(0),
    tvPrice: z.number().default(0),
    availableForConnectionTypeName: z.string().trim().default("GPON"),
    tvBundleName: z.string().trim().default(""),
    business: z.preprocess((val) => (typeof val === "boolean" || val === 0 || val === 1 ? Boolean(val) : val), z.boolean()).default(false)
}).strict();
export type TGeneric_Settings_Client_NetBundle = z.input<typeof TGeneric_Settings_Client_NetBundle>;

export const generic_settings_client_netBundleRequiredDefaults: TRequiredDefaults = {
    "name": ""
};

export const generic_settings_client_netBundleUpdateSpecs: TUpdateSpec[] = [];