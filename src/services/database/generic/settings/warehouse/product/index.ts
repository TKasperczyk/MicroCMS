import { GenericService } from "@framework/core/service";

import { TGenericSpec } from "@framework/types/service";

import { TGeneric_Settings_Warehouse_Product, generic_settings_warehouse_productRequiredDefaults, generic_settings_warehouse_productUpdateSpecs } from "./type";

export const serviceSpec: TGenericSpec<TGeneric_Settings_Warehouse_Product> = {
    serviceId: "generic.settings.warehouse.product",
    servicePath: "/generic/settings/warehouse/product",
    serviceValidator: TGeneric_Settings_Warehouse_Product,
    serviceRequiredDefaults: generic_settings_warehouse_productRequiredDefaults,
    serviceUpdateSpecs: generic_settings_warehouse_productUpdateSpecs,
    serviceIndexes: [{
        name: "name",
        types: ["unique"]
    }],
};
export type TService = TGeneric_Settings_Warehouse_Product;

export const serviceInstance = new GenericService<TGeneric_Settings_Warehouse_Product>(serviceSpec);

if (process.env.startGenericServices === "true") { 
    serviceInstance.run().then(running => running ? true : process.exit()).catch((error) => {
        console.error(error);
    });
}
