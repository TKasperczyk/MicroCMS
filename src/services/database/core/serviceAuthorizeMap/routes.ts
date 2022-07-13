import { getCrudRouteMappings } from "@framework/helpers/communication/socket";

import { TRouteMapping } from "@framework/types/communication/socket";

export const getCore_serviceAuthorizeMapRouteMappings = (routePrefix: string): TRouteMapping[] => {
    return getCrudRouteMappings(routePrefix);
};