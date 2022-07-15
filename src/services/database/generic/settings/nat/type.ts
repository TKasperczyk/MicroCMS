
import { ObjectId } from "mongodb";
import { z } from "zod";

import { TRequiredDefaults, TUpdateSpec } from "@framework/types/service";

export const TSettings_Nat = z.object({
    _id: z.instanceof(ObjectId).optional(),
    name: z.string(),
    cmsActive: z.boolean().default(false),
    natNumber: z.number(),
    description: z.string().default("")
}).strict();
export type TSettings_Nat = z.input<typeof TSettings_Nat>;

export const settings_natRequiredDefaults: TRequiredDefaults = {
    name: "",
    natNumber: 0
};

export const settings_natUpdateSpecs: TUpdateSpec[] = [];
