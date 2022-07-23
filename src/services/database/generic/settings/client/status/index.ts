
import { GenericService } from "@framework/core/service";

import { TGenericSpec } from "@framework/types/service";

import { TGeneric_Settings_Client_Status, generic_settings_client_statusRequiredDefaults, generic_settings_client_statusUpdateSpecs } from "./type";

export const serviceSpec: TGenericSpec<TGeneric_Settings_Client_Status> = {
    serviceId: "generic.settings.client.status",
    servicePath: "/generic/settings/client/status",
    serviceValidator: TGeneric_Settings_Client_Status,
    serviceRequiredDefaults: generic_settings_client_statusRequiredDefaults,
    serviceUpdateSpecs: generic_settings_client_statusUpdateSpecs,
    serviceIndexes: [{
        name: "name",
        types: ["unique"]
    }],
};
export type TService = TGeneric_Settings_Client_Status;

export const serviceInstance = new GenericService<TGeneric_Settings_Client_Status>(serviceSpec);

if (process.env.startGenericServices === "true") { 
    serviceInstance.run().then(running => running ? true : process.exit()).catch((error) => {
        console.error(error);
    });
}
