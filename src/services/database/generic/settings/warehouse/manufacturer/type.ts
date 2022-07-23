
import { ObjectId } from "mongodb";
import { z } from "zod";

import { TRequiredDefaults, TUpdateSpec } from "@framework/types/service";

export const TGeneric_Settings_Warehouse_Manufacturer = z.object({
    _id: z.instanceof(ObjectId).optional(),
    name: z.string().trim(),
    description: z.string().trim().default(""),
    support: z.string().trim().default("")
}).strict();
export type TGeneric_Settings_Warehouse_Manufacturer = z.input<typeof TGeneric_Settings_Warehouse_Manufacturer>;

export const generic_settings_warehouse_manufacturerRequiredDefaults: TRequiredDefaults = {
    "name": ""
};

export const generic_settings_warehouse_manufacturerUpdateSpecs: TUpdateSpec[] = [];
