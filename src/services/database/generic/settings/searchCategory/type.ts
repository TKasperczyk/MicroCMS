import { ObjectId } from "mongodb";
import { z } from "zod";

import { TRequiredDefaults, TUpdateSpec } from "@framework/types/service";

export const TSettings_SearchCategory = z.object({
    _id: z.instanceof(ObjectId).optional(),
    name: z.string(),
    inputPattern: z.string().default(""),
    dbName: z.string().default(""),
    operator: z.string().default(""),
    dbOperator: z.string().default(""),
    select: z.boolean().default(false),
    selectApiPath: z.string().default(""),
    selectApiFilter: z.string().default(""),
    selectDisplayKey: z.string().default(""),
    selectDisplayKeyMergeSeparator: z.string().default(""),
    selectDisplayKeyMergeWith: z.array(z.string()).default([]),
    selectValueKey: z.string().default(""),
    selectValueKeyMergeSeparator: z.string().default(""),
    selectValueKeyMergeWith: z.array(z.string()).default([]),
    selectType: z.string().default(""),
    selectCustomOptions: z.array(z.object({
        value: z.string().default(""),
        display: z.string().default(""),
    })).default([])
}).strict();
export type TSettings_SearchCategory = z.input<typeof TSettings_SearchCategory>;

export const settings_searchCategoryRequiredDefaults: TRequiredDefaults = {
    "name": ""
};

export const settings_searchCategoryUpdateSpecs: TUpdateSpec[] = [{
    type: "array",
    toCollection: "data.user",
    toField: "settings.client.searchCategories",
    idField: "name"
}];