
import { ObjectId } from "mongodb";
import { z } from "zod";

import { TRequiredDefaults, TUpdateSpec } from "@framework/types/service";

export const TGeneric_Settings_EmlTemplate = z.object({
    _id: z.instanceof(ObjectId).optional(),
    name: z.string().trim(),
    templateSubjectString: z.string().trim().default(""),
    templateBodyString: z.string().trim().default(""),
    kind: z.string().trim().default("")
}).strict();
export type TGeneric_Settings_EmlTemplate = z.input<typeof TGeneric_Settings_EmlTemplate>;

export const generic_settings_emlTemplateRequiredDefaults: TRequiredDefaults = {
    "name": ""
};

export const generic_settings_emlTemplateUpdateSpecs: TUpdateSpec[] = [];
