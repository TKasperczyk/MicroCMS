import { z } from "zod";

export const TRouteMapping = z.object({
    route: z.string(),
    method: z.string(),
    eventName: z.string()
}).strict();
export type TRouteMapping = z.input<typeof TRouteMapping>;