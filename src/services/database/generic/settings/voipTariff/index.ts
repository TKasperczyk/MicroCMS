import { GenericService } from "@framework/core/service";

import { TSettings_VoipTariff, settings_voipTariffRequiredDefaults, settings_voipTariffUpdateSpecs } from "./type";

new GenericService<TSettings_VoipTariff>({
    serviceId: "settings.voipTariff",
    servicePath: "settings/voipTariff",
    serviceValidator: TSettings_VoipTariff,
    serviceRequiredDefaults: settings_voipTariffRequiredDefaults,
    serviceUpdateSpecs: settings_voipTariffUpdateSpecs,
    serviceIndexes: [{
        name: "name",
        types: ["unique"]
    }, {
        name: "contents.regionCode",
        types: ["sparse"]
    }],
}).run().then(running => running ? true : process.exit()).catch((error) => {
    console.error(error);
});
