import { z } from "zod";

import { RouteMapping } from "@framework/types/communication/socket/RouteMapping";

export const DiscoveryPack = z.object({
    routeMappings: z.array(RouteMapping),
    port: z.number()
}).strict();
export type DiscoveryPack = z.infer<typeof DiscoveryPack>;