import { GenericService } from "@framework/core/service";

import { TGenericSpec } from "@framework/types/service";

import { TGeneric_Settings_Client_NetBundle, generic_settings_client_netBundleRequiredDefaults, generic_settings_client_netBundleUpdateSpecs } from "./type";

export const serviceSpec: TGenericSpec<TGeneric_Settings_Client_NetBundle> = {
    serviceId: "generic.settings.client.netBundle",
    servicePath: "/generic/settings/client/netBundle",
    serviceValidator: TGeneric_Settings_Client_NetBundle,
    serviceRequiredDefaults: generic_settings_client_netBundleRequiredDefaults,
    serviceUpdateSpecs: generic_settings_client_netBundleUpdateSpecs,
    serviceIndexes: [{
        name: "name",
        types: ["unique"]
    }],
};

export type TService = TGeneric_Settings_Client_NetBundle;

export const serviceInstance = new GenericService<TGeneric_Settings_Client_NetBundle>(serviceSpec);

if (process.env.startGenericServices === "true") { 
    serviceInstance.run().then(running => running ? true : process.exit()).catch((error) => {
        console.error(error);
    });
}