import { z } from "zod";

import { RouteMapping } from "@framework/types/communication/socket/RouteMapping";

export const DiscoveryPack = z.object({
    routeMappings: z.array(RouteMapping),
    serviceId: z.string()
}).strict();
export type DiscoveryPack = z.infer<typeof DiscoveryPack>;