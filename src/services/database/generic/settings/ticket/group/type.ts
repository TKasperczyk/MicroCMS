import { ObjectId } from "mongodb";
import { z } from "zod";

import { TRequiredDefaults, TUpdateSpec } from "@framework/types/service";

export const TGeneric_Settings_Ticket_Group = z.object({
    _id: z.instanceof(ObjectId).optional(),
    name: z.string().trim(),
    description: z.string().trim().default(""),
    colour: z.string().trim().default("#2CD100"),
    membershipLogins: z.array(z.string().trim()).default([]),
    showInSearch: z.boolean().default(false)
}).strict();
export type TGeneric_Settings_Ticket_Group = z.input<typeof TGeneric_Settings_Ticket_Group>;

export const generic_settings_ticket_groupRequiredDefaults: TRequiredDefaults = {
    "name": ""
};

export const generic_settings_ticket_groupUpdateSpecs: TUpdateSpec[] = [{
    type: "array",
    toCollection: "data.user",
    toField: "generic.settings.ticket.groups",
    idField: "name"
}];