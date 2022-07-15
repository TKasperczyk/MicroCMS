import { GenericService } from "@framework/core/service";

import { TSettings_WarehouseProduct, settings_warehouseProductRequiredDefaults, settings_warehouseProductUpdateSpecs } from "./type";

new GenericService<TSettings_WarehouseProduct>({
    serviceId: "settings.warehouseProduct",
    servicePath: "settings/warehouseProduct",
    serviceValidator: TSettings_WarehouseProduct,
    serviceRequiredDefaults: settings_warehouseProductRequiredDefaults,
    serviceUpdateSpecs: settings_warehouseProductUpdateSpecs,
    serviceIndexes: [{
        name: "name",
        types: ["unique"]
    }],
}).run().then(running => running ? true : process.exit()).catch((error) => {
    console.error(error);
});
