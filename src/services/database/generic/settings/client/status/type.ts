
import { ObjectId } from "mongodb";
import { z } from "zod";

import { TRequiredDefaults, TUpdateSpec } from "@framework/types/service";

export const TGeneric_Settings_Client_Status = z.object({
    _id: z.instanceof(ObjectId).optional(),
    name: z.string().trim(),
    description: z.string().trim().default("")
}).strict();
export type TGeneric_Settings_Client_Status = z.input<typeof TGeneric_Settings_Client_Status>;

export const generic_settings_client_statusRequiredDefaults: TRequiredDefaults = {
    "name": ""
};

export const generic_settings_client_statusUpdateSpecs: TUpdateSpec[] = [];
