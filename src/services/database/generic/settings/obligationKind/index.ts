
import { GenericService } from "@framework/core/service";

import { TGenericSpec } from "@framework/types/service";

import { TGeneric_Settings_ObligationKind, generic_settings_obligationKindRequiredDefaults, generic_settings_obligationKindUpdateSpecs } from "./type";

export const serviceSpec: TGenericSpec<TGeneric_Settings_ObligationKind> = {
    serviceId: "generic.settings.obligationKind",
    servicePath: "/generic/settings/obligationKind",
    serviceValidator: TGeneric_Settings_ObligationKind,
    serviceRequiredDefaults: generic_settings_obligationKindRequiredDefaults,
    serviceUpdateSpecs: generic_settings_obligationKindUpdateSpecs,
    serviceIndexes: [{
        name: "name",
        types: ["unique"]
    }],
};
export type TService = TGeneric_Settings_ObligationKind;

export const serviceInstance = new GenericService<TGeneric_Settings_ObligationKind>(serviceSpec);

if (process.env.startGenericServices === "true") { 
    serviceInstance.run().then(running => running ? true : process.exit()).catch((error) => {
        console.error(error);
    });
}
