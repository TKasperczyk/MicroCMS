import { crudRouteMapping } from "@framework/helpers/communication/socket";

import { TRouteMapping } from "@framework/types/communication/socket";

export const getAuthorizeMapTRouteMappings = (routePrefix: string): TRouteMapping[] => {
    return crudRouteMapping(routePrefix);
};