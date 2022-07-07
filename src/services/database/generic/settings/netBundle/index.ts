import { runGenericService } from "@framework/service/generic";

import { TNetBundle, netBundleRequiredDefaults } from "./type";

runGenericService<TNetBundle>({
    serviceId: "settings.netBundle",
    servicePath: "/settings/netBundle",
    serviceValidator: TNetBundle,
    serviceRequiredDefaults: netBundleRequiredDefaults,
    serviceIndexes: [],
    serviceUniqueIndexes: ["name"]
}).then().catch((error) => {
    console.error(error);
});
