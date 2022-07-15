
import { ObjectId } from "mongodb";
import { z } from "zod";

import { TRequiredDefaults, TUpdateSpec } from "@framework/types/service";

export const TSettings_VoipTariff = z.object({
    _id: z.instanceof(ObjectId).optional(),
    name: z.string(),
    contents: z.array(z.object({
        regionCode: z.string(),
        region: z.string().default(""),
        minutePrice: z.number().default(0)
    })).default([])
}).strict();
export type TSettings_VoipTariff = z.input<typeof TSettings_VoipTariff>;

export const settings_voipTariffRequiredDefaults: TRequiredDefaults = {
    "name": ""
};

export const settings_voipTariffUpdateSpecs: TUpdateSpec[] = [];
