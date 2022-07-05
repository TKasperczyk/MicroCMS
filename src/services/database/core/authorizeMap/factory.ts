import { TFactory } from "@framework/types/service";

import { TAuthorizeMap } from "./type";

export const createAuthorizeMap: TFactory<TAuthorizeMap> = (netBundle: TAuthorizeMap): TAuthorizeMap => {
    return TAuthorizeMap.parse(netBundle);
};