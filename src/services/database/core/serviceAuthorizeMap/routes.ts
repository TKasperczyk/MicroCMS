import { getCrudRouteMapping } from "@framework/helpers/communication/socket";

import { TRouteMapping } from "@framework/types/communication/socket";

export const getServiceAuthorizeMapTRouteMappings = (routePrefix: string): TRouteMapping[] => {
    return getCrudRouteMapping(routePrefix);
};