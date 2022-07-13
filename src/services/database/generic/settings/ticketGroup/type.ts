import { ObjectId } from "mongodb";
import { z } from "zod";

import { TRequiredDefaults, TUpdateSpec } from "@framework/types/service";

export const TSettings_TicketGroup = z.object({
    _id: z.instanceof(ObjectId).optional(),
    name: z.string(),
    description: z.string().default(""),
    colour: z.string().default("#2CD100"),
    membershipLogins: z.array(z.string()).default([]),
    showInSearch: z.boolean().default(false)
}).strict();
export type TSettings_TicketGroup = z.input<typeof TSettings_TicketGroup>;

export const settings_ticketGroupRequiredDefaults: TRequiredDefaults = {
    "name": ""
};

export const settings_ticketGroupUpdateSpecs: TUpdateSpec[] = [{
    type: "array",
    toCollection: "data.user",
    toField: "settings.ticket.groups",
    idField: "name"
}];