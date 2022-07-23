
import { GenericService } from "@framework/core/service";

import { TGenericSpec } from "@framework/types/service";

import { TGeneric_Settings_Warehouse_Manufacturer, generic_settings_warehouse_manufacturerRequiredDefaults, generic_settings_warehouse_manufacturerUpdateSpecs } from "./type";

export const serviceSpec: TGenericSpec<TGeneric_Settings_Warehouse_Manufacturer> = {
    serviceId: "generic.settings.warehouse.manufacturer",
    servicePath: "/generic/settings/warehouse/manufacturer",
    serviceValidator: TGeneric_Settings_Warehouse_Manufacturer,
    serviceRequiredDefaults: generic_settings_warehouse_manufacturerRequiredDefaults,
    serviceUpdateSpecs: generic_settings_warehouse_manufacturerUpdateSpecs,
    serviceIndexes: [{
        name: "name",
        types: ["unique"]
    }],
};
export type TService = TGeneric_Settings_Warehouse_Manufacturer;

export const serviceInstance = new GenericService<TGeneric_Settings_Warehouse_Manufacturer>(serviceSpec);

if (process.env.startGenericServices === "true") { 
    serviceInstance.run().then(running => running ? true : process.exit()).catch((error) => {
        console.error(error);
    });
}
