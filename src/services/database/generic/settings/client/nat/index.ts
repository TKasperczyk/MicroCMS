import { GenericService } from "@framework/core/service";

import { TGenericSpec } from "@framework/types/service";

import { TGeneric_Settings_Client_Nat, generic_settings_client_natRequiredDefaults, generic_settings_client_natUpdateSpecs } from "./type";

export const serviceSpec: TGenericSpec<TGeneric_Settings_Client_Nat> = {
    serviceId: "generic.settings.client.nat",
    servicePath: "/generic/settings/client/nat",
    serviceValidator: TGeneric_Settings_Client_Nat,
    serviceRequiredDefaults: generic_settings_client_natRequiredDefaults,
    serviceUpdateSpecs: generic_settings_client_natUpdateSpecs,
    serviceIndexes: [{
        name: "name",
        types: ["unique"]
    }, {
        name: "natNumber",
        types: ["unique"]
    }],
};

export type TService = TGeneric_Settings_Client_Nat;

export const serviceInstance = new GenericService<TGeneric_Settings_Client_Nat>(serviceSpec);

if (process.env.startGenericServices === "true") { 
    serviceInstance.run().then(running => running ? true : process.exit()).catch((error) => {
        console.error(error);
    });
}