import { GenericService } from "@framework/core/service";

import { TGenericSpec } from "@framework/types/service";

import { TGeneric_Settings_Ticket_Group, generic_settings_ticket_groupRequiredDefaults, generic_settings_ticket_groupUpdateSpecs } from "./type";

export const serviceSpec: TGenericSpec<TGeneric_Settings_Ticket_Group> = {
    serviceId: "generic.settings.ticket.group",
    servicePath: "/generic/settings/ticket/group",
    serviceValidator: TGeneric_Settings_Ticket_Group,
    serviceRequiredDefaults: generic_settings_ticket_groupRequiredDefaults,
    serviceUpdateSpecs: generic_settings_ticket_groupUpdateSpecs,
    serviceIndexes: [{
        name: "name",
        types: ["unique"]
    }],
};
export type TService = TGeneric_Settings_Ticket_Group;

export const serviceInstance = new GenericService<TGeneric_Settings_Ticket_Group>(serviceSpec);

if (process.env.startGenericServices === "true") { 
    serviceInstance.run().then(running => running ? true : process.exit()).catch((error) => {
        console.error(error);
    });
}