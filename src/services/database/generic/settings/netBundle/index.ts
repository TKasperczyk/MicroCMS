import { GenericService } from "@framework/core/service";

import { TSettings_NetBundle, settings_netBundleRequiredDefaults, settings_netBundleUpdateSpecs } from "./type";

new GenericService<TSettings_NetBundle>({
    serviceId: "settings.netBundle",
    servicePath: "/settings/netBundle",
    serviceValidator: TSettings_NetBundle,
    serviceRequiredDefaults: settings_netBundleRequiredDefaults,
    serviceUpdateSpecs: settings_netBundleUpdateSpecs,
    serviceIndexes: [{
        name: "name",
        types: ["unique"]
    }],
}).run().then(running => running ? true : process.exit()).catch((error) => {
    console.error(error);
});