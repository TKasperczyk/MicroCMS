
import { ObjectId } from "mongodb";
import { z } from "zod";

import { TRequiredDefaults, TUpdateSpec } from "@framework/types/service";

export const TGeneric_Settings_Client_AgreementLength = z.object({
    _id: z.instanceof(ObjectId).optional(),
    name: z.string().trim(),
    length: z.number().default(24)
}).strict();
export type TGeneric_Settings_Client_AgreementLength = z.input<typeof TGeneric_Settings_Client_AgreementLength>;

export const generic_settings_client_agreementLengthRequiredDefaults: TRequiredDefaults = {
    "name": ""
};

export const generic_settings_client_agreementLengthUpdateSpecs: TUpdateSpec[] = [];
