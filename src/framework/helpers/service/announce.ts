import { wait } from "@framework/helpers";

import { TDiscoveryPack } from "@framework/types/communication/express";
import { TRouteMapping } from "@framework/types/communication/socket";
import { TSetupObject } from "@framework/types/service";

export const announce = async (serviceId: string, routes: TRouteMapping[]): Promise<TSetupObject> => {
    let response: Response;
    try {
        response =  await fetch("http://127.0.0.1:3000/discovery", {
            method: "post",
            cache: "no-cache",
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ routeMappings: routes, serviceId } as TDiscoveryPack)
        });
    } catch (error) {
        throw new Error(String(error));
    }
    return TSetupObject.parse(await response.json());
};

export const reannounce = async (annouce: () => Promise<TSetupObject>): Promise<TSetupObject> => {
    let unavailable = true, setupObject = { port: 0 };
    while (unavailable) {
        try {
            setupObject = await annouce();
            unavailable = false;
        } catch (error) {
            await wait(1000);
        }
    }
    return setupObject;
};