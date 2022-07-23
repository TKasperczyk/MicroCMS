import { z } from "zod";

export const TRouteMapping = z.object({
    route: z.string().trim(),
    method: z.string().trim(),
    eventName: z.string().trim()
}).strict();
export type TRouteMapping = z.input<typeof TRouteMapping>;