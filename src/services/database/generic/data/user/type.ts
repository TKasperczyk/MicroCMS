import { ObjectId } from "mongodb";
import { z } from "zod";

import { TSettings_SearchCategory } from "@services/database/generic/settings/searchCategory/type";
import { TSettings_TicketGroup } from "@services/database/generic/settings/ticketGroup/type";

import { TRequiredDefaults, TUpdateSpec } from "@framework/types/service";

export const TData_User = z.object({
    _id: z.instanceof(ObjectId).optional(),
    login: z.string(),
    group: z.string(),
    password: z.string().optional(),
    phoneNumber: z.string().default(""),
    name: z.string().default(""),
    surname: z.string().default(""),
    email: z.string().default(""),
    settings: z.object({
        global: z.object({
            cmsConnectionMonitor: z.boolean().default(true),
            notificationMonitor: z.boolean().default(true)
        }).default({}),
        ticket: z.object({
            showInSearch: z.boolean().default(false),
            sortyByOpen: z.boolean().default(false),
            sortByPriority: z.boolean().default(false),
            paging: z.boolean().default(false),
            reminderEmail: z.string().default(""),
            groups: z.array(TSettings_TicketGroup).default([]),
            groupColours: z.array(z.object({
                groupName: z.string(),
                colour: z.string()
            })).default([]),
            lockSearch: z.boolean().default(true),
        }).default({}),
        client: z.object({
            sendStats: z.boolean().default(false),
            canSignAnAgreement: z.boolean().default(true),
            searchResultLength: z.number().default(15),
            privateSeactionFields: z.array(z.string()).default([]),
            hideEmptyState: z.boolean().default(false),
            serviceStatusMonitor: z.boolean().default(true),
            colouredFields: z.boolean().default(true),
            searchCategories: z.array(TSettings_SearchCategory).default([]),
            searchCategoryColours: z.array(z.object({
                category: z.string(),
                colour: z.string()
            })).default([])
        }).default({}),
        theme: z.string().default("dark")
    }).default({})
}).strict();
export type TData_User = z.input<typeof TData_User>;

export const data_userRequiredDefaults: TRequiredDefaults = {
    "login": "",
    "group": ""
};

export const data_userUpdateSpecs: TUpdateSpec[] = [];