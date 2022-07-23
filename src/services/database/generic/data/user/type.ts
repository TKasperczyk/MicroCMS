import { ObjectId } from "mongodb";
import { z } from "zod";

import { TGeneric_Settings_SearchCategory } from "@services/database/generic//settings/searchCategory/type";
import { TGeneric_Settings_Ticket_Group } from "@services/database/generic//settings/ticket/group/type";

import { TRequiredDefaults, TUpdateSpec } from "@framework/types/service";

export const TGeneric_Data_User = z.object({
    _id: z.instanceof(ObjectId).optional(),
    login: z.string().trim(),
    group: z.string().trim(),
    password: z.string().trim().optional(),
    phoneNumber: z.string().trim().default(""),
    name: z.string().trim().default(""),
    surname: z.string().trim().default(""),
    email: z.string().trim().default(""),
    settings: z.object({
        global: z.object({
            cmsConnectionMonitor: z.boolean().default(true),
            notificationMonitor: z.boolean().default(true)
        }).strict().default({}),
        ticket: z.object({
            showInSearch: z.boolean().default(false),
            sortyByOpen: z.boolean().default(false),
            sortByPriority: z.boolean().default(false),
            paging: z.boolean().default(false),
            reminderEmail: z.string().trim().default(""),
            groups: z.array(TGeneric_Settings_Ticket_Group).default([]),
            groupColours: z.array(z.object({
                groupName: z.string().trim(),
                colour: z.string().trim()
            }).strict()).default([]),
            lockSearch: z.boolean().default(true),
        }).strict().default({}),
        client: z.object({
            sendStats: z.boolean().default(false),
            canSignAnAgreement: z.boolean().default(true),
            searchResultLength: z.number().default(15),
            privateSeactionFields: z.array(z.string().trim()).default([]),
            hideEmptyState: z.boolean().default(false),
            serviceStatusMonitor: z.boolean().default(true),
            colouredFields: z.boolean().default(true),
            searchCategories: z.array(TGeneric_Settings_SearchCategory).default([]),
            searchCategoryColours: z.array(z.object({
                category: z.string().trim(),
                colour: z.string().trim()
            }).strict()).default([])
        }).strict().default({}),
        theme: z.string().trim().default("dark")
    }).strict().default({})
}).strict();
export type TGeneric_Data_User = z.input<typeof TGeneric_Data_User>;

export const generic_data_userRequiredDefaults: TRequiredDefaults = {
    "login": "",
    "group": ""
};

export const generic_data_userUpdateSpecs: TUpdateSpec[] = [];