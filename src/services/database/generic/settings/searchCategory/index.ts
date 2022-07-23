import { GenericService } from "@framework/core/service";

import { TGenericSpec } from "@framework/types/service";

import { TGeneric_Settings_SearchCategory, generic_settings_searchCategoryRequiredDefaults, generic_settings_searchCategoryUpdateSpecs } from "./type";

export const serviceSpec: TGenericSpec<TGeneric_Settings_SearchCategory> = {
    serviceId: "generic.settings.searchCategory",
    servicePath: "/generic/settings/searchCategory",
    serviceValidator: TGeneric_Settings_SearchCategory,
    serviceRequiredDefaults: generic_settings_searchCategoryRequiredDefaults,
    serviceUpdateSpecs: generic_settings_searchCategoryUpdateSpecs,
    serviceIndexes: []
};
export type TService = TGeneric_Settings_SearchCategory;

export const serviceInstance = new GenericService<TGeneric_Settings_SearchCategory>(serviceSpec);

if (process.env.startGenericServices === "true") { 
    serviceInstance.run().then(running => running ? true : process.exit()).catch((error) => {
        console.error(error);
    });
}
