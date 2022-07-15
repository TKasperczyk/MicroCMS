
import { ObjectId } from "mongodb";
import { z } from "zod";

import { TRequiredDefaults, TUpdateSpec } from "@framework/types/service";

export const TSettings_WarehouseProduct = z.object({
    _id: z.instanceof(ObjectId).optional(),
    name: z.string(),
    description: z.string().default(""),
    minAvailableItems: z.number().default(0)
}).strict();
export type TSettings_WarehouseProduct = z.input<typeof TSettings_WarehouseProduct>;

export const settings_warehouseProductRequiredDefaults: TRequiredDefaults = {
    "name": ""
};

export const settings_warehouseProductUpdateSpecs: TUpdateSpec[] = [];
