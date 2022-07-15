import { GenericService } from "@framework/core/service";

import { TSettings_Nat, settings_natRequiredDefaults, settings_natUpdateSpecs } from "./type";

new GenericService<TSettings_Nat>({
    serviceId: "settings.nat",
    servicePath: "settings/nat",
    serviceValidator: TSettings_Nat,
    serviceRequiredDefaults: settings_natRequiredDefaults,
    serviceUpdateSpecs: settings_natUpdateSpecs,
    serviceIndexes: [{
        name: "name",
        types: ["unique"]
    }, {
        name: "natNumber",
        types: ["unique"]
    }],
}).run().then(running => running ? true : process.exit()).catch((error) => {
    console.error(error);
});
