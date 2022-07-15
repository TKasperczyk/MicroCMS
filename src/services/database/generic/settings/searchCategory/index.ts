import { GenericService } from "@framework/core/service";

import { TSettings_SearchCategory, settings_searchCategoryRequiredDefaults, settings_searchCategoryUpdateSpecs } from "./type";

new GenericService<TSettings_SearchCategory>({
    serviceId: "settings.searchCategory",
    servicePath: "/settings/searchCategory",
    serviceValidator: TSettings_SearchCategory,
    serviceRequiredDefaults: settings_searchCategoryRequiredDefaults,
    serviceUpdateSpecs: settings_searchCategoryUpdateSpecs,
    serviceIndexes: []
}).run().then(running => running ? true : process.exit()).catch((error) => {
    console.error(error);
});
