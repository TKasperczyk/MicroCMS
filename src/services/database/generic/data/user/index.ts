import { GenericService } from "@framework/core/service";

import { TData_User, data_userRequiredDefaults, data_userUpdateSpecs } from "./type";

new GenericService<TData_User>({
    serviceId: "data.user",
    servicePath: "/data/user",
    serviceValidator: TData_User,
    serviceRequiredDefaults: data_userRequiredDefaults,
    serviceUpdateSpecs: data_userUpdateSpecs,
    serviceIndexes: [{
        name: "login",
        types: ["unique"]
    }]
}).run().then(running => running ? true : process.exit()).catch((error) => {
    console.error(error);
});