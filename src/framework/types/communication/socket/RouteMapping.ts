import { z } from "zod";

export const RouteMapping = z.object({
    route: z.string(),
    method: z.string(),
    eventName: z.string()
}).strict();
export type RouteMapping = z.infer<typeof RouteMapping>;