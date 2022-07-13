import { runGenericService } from "@framework/service/generic";

import { TData_User, data_userRequiredDefaults, data_userUpdateSpecs } from "./type";

runGenericService<TData_User>({
    serviceId: "data.user",
    servicePath: "/data/user",
    serviceValidator: TData_User,
    serviceRequiredDefaults: data_userRequiredDefaults,
    serviceUpdateSpecs: data_userUpdateSpecs,
    serviceIndexes: [],
    serviceUniqueIndexes: ["login"]
}).then().catch((error) => {
    console.error(error);
});

export * from "./type";