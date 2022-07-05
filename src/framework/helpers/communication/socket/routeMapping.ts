import { TRouteMapping } from "@framework/types/communication/socket";

export const getCrudRouteMapping = (routePrefix: string): TRouteMapping[] => {
    return [
        { method: "get", eventName: "search", route: `${routePrefix}/search` },
        { method: "get", eventName: "aggregate", route: `${routePrefix}/aggregate` },
        { method: "get", eventName: "get", route: `${routePrefix}/:id?` },
        { method: "post", eventName: "add", route: `${routePrefix}` },
        { method: "put", eventName: "update", route: `${routePrefix}/:id` },
        { method: "delete", eventName: "delete", route: `${routePrefix}/:id` },
    ];
};

export const getCoreRouteMapping = (routePrefix: string): TRouteMapping[] => {
    return [
        { method: "get", eventName: "updateAuthorizeMap", route: `${routePrefix}/updateAuthorizeMap` },
    ];
};