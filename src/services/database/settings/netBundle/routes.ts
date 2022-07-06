import { getCrudRouteMappings, getCoreRouteMappings } from "@framework/helpers/communication/socket";

import { TRouteMapping } from "@framework/types/communication/socket";

export const getNetBundleRouteMappings = (routePrefix: string): TRouteMapping[] => {
    return getCoreRouteMappings(routePrefix).concat(getCrudRouteMappings(routePrefix));
};