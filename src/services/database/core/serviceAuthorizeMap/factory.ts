import { TFactory } from "@framework/types/service";

import { TServiceAuthorizeMap } from "./type";

export const createServiceAuthorizeMap: TFactory<TServiceAuthorizeMap> = (serviceAuthorizeMap: TServiceAuthorizeMap): TServiceAuthorizeMap => {
    return TServiceAuthorizeMap.parse(serviceAuthorizeMap);
};