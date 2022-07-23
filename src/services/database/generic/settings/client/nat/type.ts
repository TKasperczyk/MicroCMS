
import { ObjectId } from "mongodb";
import { z } from "zod";

import { TRequiredDefaults, TUpdateSpec } from "@framework/types/service";

export const TGeneric_Settings_Client_Nat = z.object({
    _id: z.instanceof(ObjectId).optional(),
    name: z.string().trim(),
    cmsActive: z.boolean().default(false),
    natNumber: z.number(),
    description: z.string().trim().default("")
}).strict();
export type TGeneric_Settings_Client_Nat = z.input<typeof TGeneric_Settings_Client_Nat>;

export const generic_settings_client_natRequiredDefaults: TRequiredDefaults = {
    name: "",
    natNumber: 0
};

export const generic_settings_client_natUpdateSpecs: TUpdateSpec[] = [];
