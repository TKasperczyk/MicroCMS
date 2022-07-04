import { z } from "zod";

import { TRouteMapping } from "@framework/types/communication/socket/RouteMapping";

export const TDiscoveryPack = z.object({
    routeMappings: z.array(TRouteMapping),
    serviceId: z.string()
}).strict();
export type TDiscoveryPack = z.input<typeof TDiscoveryPack>;