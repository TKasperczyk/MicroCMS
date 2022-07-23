
import { ObjectId } from "mongodb";
import { z } from "zod";

import { TRequiredDefaults, TUpdateSpec } from "@framework/types/service";

export const TGeneric_Settings_Warehouse_Product = z.object({
    _id: z.instanceof(ObjectId).optional(),
    name: z.string().trim(),
    description: z.string().trim().default(""),
    minAvailableItems: z.number().default(0)
}).strict();
export type TGeneric_Settings_Warehouse_Product = z.input<typeof TGeneric_Settings_Warehouse_Product>;

export const generic_settings_warehouse_productRequiredDefaults: TRequiredDefaults = {
    "name": ""
};

export const generic_settings_warehouse_productUpdateSpecs: TUpdateSpec[] = [];
