import { RouteMapping } from "@framework/types/communication/socket";

export const getRoutes = (routePrefix: string): RouteMapping[] => {
    return [
        { method: "get", eventName: "search", route: `${routePrefix}/netBundle/search` },
        { method: "get", eventName: "aggregate", route: `${routePrefix}/netBundle/aggregate` },
        { method: "get", eventName: "get", route: `${routePrefix}/netBundle/:id?` },
        { method: "post", eventName: "add", route: `${routePrefix}/netBundle` },
        { method: "put", eventName: "update", route: `${routePrefix}/netBundle/:id` },
        { method: "delete", eventName: "delete", route: `${routePrefix}/netBundle/:id` },
    ];
};