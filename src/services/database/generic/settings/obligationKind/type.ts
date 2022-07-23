
import { ObjectId } from "mongodb";
import { z } from "zod";

import { TRequiredDefaults, TUpdateSpec } from "@framework/types/service";

export const TGeneric_Settings_ObligationKind = z.object({
    _id: z.instanceof(ObjectId).optional(),
    name: z.string().trim(),
    description: z.string().trim().default(""),
    shortDescription: z.string().trim().default(""),
    canRepeat: z.boolean().default(true),
    attribute: z.enum(["EE", "FP", ""]).default(""),
    gtu: z.string().trim().default(""),
    vat: z.number().default(23)
}).strict();
export type TGeneric_Settings_ObligationKind = z.input<typeof TGeneric_Settings_ObligationKind>;

export const generic_settings_obligationKindRequiredDefaults: TRequiredDefaults = {
    "name": ""
};

export const generic_settings_obligationKindUpdateSpecs: TUpdateSpec[] = [];
