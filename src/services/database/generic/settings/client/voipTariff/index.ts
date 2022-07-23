import { GenericService } from "@framework/core/service";

import { TGenericSpec } from "@framework/types/service";

import { TGeneric_Settings_Client_VoipTariff, generic_settings_client_voipTariffRequiredDefaults, generic_settings_client_voipTariffUpdateSpecs } from "./type";

export const serviceSpec: TGenericSpec<TGeneric_Settings_Client_VoipTariff> = {
    serviceId: "generic.settings.client.voipTariff",
    servicePath: "/generic/settings/client/voipTariff",
    serviceValidator: TGeneric_Settings_Client_VoipTariff,
    serviceRequiredDefaults: generic_settings_client_voipTariffRequiredDefaults,
    serviceUpdateSpecs: generic_settings_client_voipTariffUpdateSpecs,
    serviceIndexes: [{
        name: "name",
        types: ["unique"]
    }, {
        name: "contents.regionCode",
        types: ["sparse"]
    }],
};
export type TService = TGeneric_Settings_Client_VoipTariff;

export const serviceInstance = new GenericService<TGeneric_Settings_Client_VoipTariff>(serviceSpec);

if (process.env.startGenericServices === "true") { 
    serviceInstance.run().then(running => running ? true : process.exit()).catch((error) => {
        console.error(error);
    });
}
