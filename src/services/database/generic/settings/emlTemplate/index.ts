
import { GenericService } from "@framework/core/service";

import { TGenericSpec } from "@framework/types/service";

import { TGeneric_Settings_EmlTemplate, generic_settings_emlTemplateRequiredDefaults, generic_settings_emlTemplateUpdateSpecs } from "./type";

export const serviceSpec: TGenericSpec<TGeneric_Settings_EmlTemplate> = {
    serviceId: "generic.settings.emlTemplate",
    servicePath: "/generic/settings/emlTemplate",
    serviceValidator: TGeneric_Settings_EmlTemplate,
    serviceRequiredDefaults: generic_settings_emlTemplateRequiredDefaults,
    serviceUpdateSpecs: generic_settings_emlTemplateUpdateSpecs,
    serviceIndexes: [{
        name: "name",
        types: ["unique"]
    }],
};
export type TService = TGeneric_Settings_EmlTemplate;

export const serviceInstance = new GenericService<TGeneric_Settings_EmlTemplate>(serviceSpec);

if (process.env.startGenericServices === "true") { 
    serviceInstance.run().then(running => running ? true : process.exit()).catch((error) => {
        console.error(error);
    });
}
