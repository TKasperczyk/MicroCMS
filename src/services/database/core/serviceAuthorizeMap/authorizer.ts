import { Authorizer } from "@framework/core/communication";

import { TAuthorizeMap } from "@framework/types/communication";

import { TCore_ServiceAuthorizeMap } from "./type";

const core_serviceAuthorizeMapAuthorizeMap: TAuthorizeMap = {};

export class Core_ServiceAuthorizeMapAuthorizer extends Authorizer<TCore_ServiceAuthorizeMap> { }

export const getCore_serviceAuthorizeMapAuthorizer = (): Promise<Core_ServiceAuthorizeMapAuthorizer> => {
    return new Promise((resolve) => {
        resolve(new Core_ServiceAuthorizeMapAuthorizer(core_serviceAuthorizeMapAuthorizeMap, "serviceAuthorizeMap"));
    });
};