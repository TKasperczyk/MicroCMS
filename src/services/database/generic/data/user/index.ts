import { GenericService } from "@framework/core/service";

import { TGenericSpec } from "@framework/types/service";

import { TGeneric_Data_User, generic_data_userRequiredDefaults, generic_data_userUpdateSpecs } from "./type";

export const serviceSpec: TGenericSpec<TGeneric_Data_User> = {
    serviceId: "generic.data.user",
    servicePath: "/generic/data/user",
    serviceValidator: TGeneric_Data_User,
    serviceRequiredDefaults: generic_data_userRequiredDefaults,
    serviceUpdateSpecs: generic_data_userUpdateSpecs,
    serviceIndexes: [{
        name: "login",
        types: ["unique"]
    }]
};
export type TService = TGeneric_Data_User;

export const serviceInstance = new GenericService<TGeneric_Data_User>(serviceSpec);

if (process.env.startGenericServices === "true") { 
    serviceInstance.run().then(running => running ? true : process.exit()).catch((error) => {
        console.error(error);
    });
}