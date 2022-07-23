
import { GenericService } from "@framework/core/service";

import { TGenericSpec } from "@framework/types/service";

import { TGeneric_Settings_SmsTemplate, generic_settings_smsTemplateRequiredDefaults, generic_settings_smsTemplateUpdateSpecs } from "./type";

export const serviceSpec: TGenericSpec<TGeneric_Settings_SmsTemplate> = {
    serviceId: "generic.settings.smsTemplate",
    servicePath: "/generic/settings/smsTemplate",
    serviceValidator: TGeneric_Settings_SmsTemplate,
    serviceRequiredDefaults: generic_settings_smsTemplateRequiredDefaults,
    serviceUpdateSpecs: generic_settings_smsTemplateUpdateSpecs,
    serviceIndexes: [{
        name: "name",
        types: ["unique"]
    }],
};
export type TService = TGeneric_Settings_SmsTemplate;

export const serviceInstance = new GenericService<TGeneric_Settings_SmsTemplate>(serviceSpec);

if (process.env.startGenericServices === "true") { 
    serviceInstance.run().then(running => running ? true : process.exit()).catch((error) => {
        console.error(error);
    });
}
