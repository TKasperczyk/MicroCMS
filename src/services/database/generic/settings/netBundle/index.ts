import { runGenericService } from "@framework/service/generic";

import { TSettings_NetBundle, settings_netBundleRequiredDefaults, settings_netBundleUpdateSpecs } from "./type";

runGenericService<TSettings_NetBundle>({
    serviceId: "settings.netBundle",
    servicePath: "/settings/netBundle",
    serviceValidator: TSettings_NetBundle,
    serviceRequiredDefaults: settings_netBundleRequiredDefaults,
    serviceUpdateSpecs: settings_netBundleUpdateSpecs,
    serviceIndexes: [],
    serviceUniqueIndexes: ["name"]
}).then().catch((error) => {
    console.error(error);
});
