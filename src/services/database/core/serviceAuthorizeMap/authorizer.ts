import { Authorizer } from "@framework/helpers/communication";

import { TAuthorizeMap } from "@framework/types/communication";

import { TServiceAuthorizeMap } from "./type";

const serviceAuthorizeMapAuthorizeMap: TAuthorizeMap = {};

export class ServiceAuthorizeMapAuthorizer extends Authorizer<TServiceAuthorizeMap> { }

export const getServiceAuthorizeMapAuthorizer = (): Promise<ServiceAuthorizeMapAuthorizer> => {
    return new Promise((resolve) => {
        resolve(new ServiceAuthorizeMapAuthorizer(serviceAuthorizeMapAuthorizeMap, "serviceAuthorizeMap"));
    });
};