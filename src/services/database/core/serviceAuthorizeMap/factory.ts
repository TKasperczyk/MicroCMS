import { TFactory } from "@framework/types/service";

import { TCore_ServiceAuthorizeMap } from "./type";

export const createCore_serviceAuthorizeMap: TFactory<TCore_ServiceAuthorizeMap> = (serviceAuthorizeMap: TCore_ServiceAuthorizeMap): TCore_ServiceAuthorizeMap => {
    return TCore_ServiceAuthorizeMap.parse(serviceAuthorizeMap);
};