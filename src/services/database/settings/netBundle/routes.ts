import { crudRouteMapping } from "@framework/helpers/communication/socket";

import { TRouteMapping } from "@framework/types/communication/socket";

export const getNetBundleTRouteMappings = (routePrefix: string): TRouteMapping[] => {
    return crudRouteMapping(routePrefix);
};