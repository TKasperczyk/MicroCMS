import { appLogger } from "@framework/logger";

import { DiscoveryPack } from "@framework/types/communication/express";
import { RouteMapping } from "@framework/types/communication/socket";
import { SetupObject } from "@framework/types/service";

const ml = appLogger("netBundle");

export const netBundleAnnounce = async (routes: RouteMapping[]): Promise<SetupObject> => {
    ml.debug("Announcing the service");
    let response: Response;
    try {
        response =  await fetch("http://127.0.0.1:3000/discovery", {
            method: "post",
            cache: "no-cache",
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ routeMappings: routes, serviceId: "/settings/netBundle" } as DiscoveryPack)
        });
    } catch (error) {
        ml.error(`Failed to announce the service ${String(error)}`);
        throw new Error(String(error));
    }
    return SetupObject.parse(await response.json());
};