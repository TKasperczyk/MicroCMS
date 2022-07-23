
import { GenericService } from "@framework/core/service";

import { TGenericSpec } from "@framework/types/service";

import { TGeneric_Settings_Client_AgreementLength, generic_settings_client_agreementLengthRequiredDefaults, generic_settings_client_agreementLengthUpdateSpecs } from "./type";

export const serviceSpec: TGenericSpec<TGeneric_Settings_Client_AgreementLength> = {
    serviceId: "generic.settings.client.agreementLength",
    servicePath: "/generic/settings/client/agreementLength",
    serviceValidator: TGeneric_Settings_Client_AgreementLength,
    serviceRequiredDefaults: generic_settings_client_agreementLengthRequiredDefaults,
    serviceUpdateSpecs: generic_settings_client_agreementLengthUpdateSpecs,
    serviceIndexes: [{
        name: "name",
        types: ["unique"]
    }],
};
export type TService = TGeneric_Settings_Client_AgreementLength;
export const serviceInstance = new GenericService<TGeneric_Settings_Client_AgreementLength>(serviceSpec);

if (process.env.startGenericServices === "true") {
    serviceInstance.run().then(running => running ? true : process.exit()).catch((error) => {
        console.error(error);
    });    
}