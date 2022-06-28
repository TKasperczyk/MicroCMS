import { wait } from "@framework/helpers";

import { SetupObject } from "@framework/types/service";

export const reannounce = async (annouce: () => Promise<SetupObject>): Promise<SetupObject> => {
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