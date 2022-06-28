import { DiscoveryPack } from "@framework/types/communication/express";
import { RouteMapping } from "@framework/types/communication/socket";
import { SetupObject } from "@framework/types/service";

export const netBundleAnnounce = async (routes: RouteMapping[]): Promise<SetupObject> => {
    const response =  await fetch("http://127.0.0.1:3000/discovery", {
        method: "post",
        cache: "no-cache",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ routeMappings: routes, serviceId: "/settings/netBundle" } as DiscoveryPack)
    });
    return SetupObject.parse(await response.json());
};