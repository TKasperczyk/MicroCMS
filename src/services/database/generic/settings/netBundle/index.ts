import { runGenericService } from "@framework/service/generic";

import { TNetBundle, netBundleRequiredDefaults } from "./type";

runGenericService<TNetBundle>(
    "settings.netBundle",
    "/settings/netBundle",
    TNetBundle,
    netBundleRequiredDefaults,
    [],
    ["name"]
).then().catch((error) => {
    console.error(error);
});
