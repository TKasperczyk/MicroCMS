
import { ObjectId } from "mongodb";
import { z } from "zod";

import { TRequiredDefaults, TUpdateSpec } from "@framework/types/service";

export const TGeneric_Settings_SmsTemplate = z.object({
    _id: z.instanceof(ObjectId).optional(),
    name: z.string().trim(),
    title: z.string().trim().default(""),
    contents: z.string().trim().default("")
}).strict();
export type TGeneric_Settings_SmsTemplate = z.input<typeof TGeneric_Settings_SmsTemplate>;

export const generic_settings_smsTemplateRequiredDefaults: TRequiredDefaults = {
    "name": ""
};

export const generic_settings_smsTemplateUpdateSpecs: TUpdateSpec[] = [];
