
import { ObjectId } from "mongodb";
import { z } from "zod";

import { TRequiredDefaults, TUpdateSpec } from "@framework/types/service";

export const TGeneric_Settings_Client_VoipTariff = z.object({
    _id: z.instanceof(ObjectId).optional(),
    name: z.string().trim(),
    contents: z.array(z.object({
        regionCode: z.string().trim(),
        region: z.string().trim().default(""),
        minutePrice: z.number().default(0)
    }).strict()).default([])
}).strict();
export type TGeneric_Settings_Client_VoipTariff = z.input<typeof TGeneric_Settings_Client_VoipTariff>;

export const generic_settings_client_voipTariffRequiredDefaults: TRequiredDefaults = {
    "name": ""
};

export const generic_settings_client_voipTariffUpdateSpecs: TUpdateSpec[] = [];
