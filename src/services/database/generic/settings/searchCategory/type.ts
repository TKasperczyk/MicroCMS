import { ObjectId } from "mongodb";
import { z } from "zod";

import { TRequiredDefaults, TUpdateSpec } from "@framework/types/service";

export const TGeneric_Settings_SearchCategory = z.object({
    _id: z.instanceof(ObjectId).optional(),
    name: z.string().trim(),
    inputPattern: z.string().trim().default(""),
    dbName: z.string().trim().default(""),
    operator: z.string().trim().default(""),
    dbOperator: z.string().trim().default(""),
    select: z.boolean().default(false),
    selectApiPath: z.string().trim().default(""),
    selectApiFilter: z.string().trim().default(""),
    selectDisplayKey: z.string().trim().default(""),
    selectDisplayKeyMergeSeparator: z.string().trim().default(""),
    selectDisplayKeyMergeWith: z.array(z.string().trim()).default([]),
    selectValueKey: z.string().trim().default(""),
    selectValueKeyMergeSeparator: z.string().trim().default(""),
    selectValueKeyMergeWith: z.array(z.string().trim()).default([]),
    selectType: z.string().trim().default(""),
    selectCustomOptions: z.array(z.object({
        value: z.string().trim().default(""),
        display: z.string().trim().default(""),
    }).strict()).default([])
}).strict();
export type TGeneric_Settings_SearchCategory = z.input<typeof TGeneric_Settings_SearchCategory>;

export const generic_settings_searchCategoryRequiredDefaults: TRequiredDefaults = {
    "name": ""
};

export const generic_settings_searchCategoryUpdateSpecs: TUpdateSpec[] = [{
    type: "array",
    toCollection: "data.user",
    toField: "generic.settings.client.searchCategories",
    idField: "name"
}];