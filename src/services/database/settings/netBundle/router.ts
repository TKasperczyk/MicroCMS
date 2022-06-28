import { crudRouteMapping } from "@framework/helpers/communication/socket";

import { RouteMapping } from "@framework/types/communication/socket";

export const getNetBundleRouteMappings = (routePrefix: string): RouteMapping[] => {
    return crudRouteMapping(routePrefix);
};