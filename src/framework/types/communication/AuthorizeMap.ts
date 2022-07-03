import { z } from "zod";

export const TAuthorizeMapEntry = z.object({
    hiddenReadFields: z.array(z.string()),
    forbiddenWriteFields: z.array(z.string()),
    forbiddenOperations: z.array(z.string())
}).strict();
export type TAuthorizeMapEntry = z.infer<typeof TAuthorizeMapEntry>;

export const TAuthorizeMap = z.object({
    user: z.object({}).catchall(TAuthorizeMapEntry),
    group: z.object({}).catchall(TAuthorizeMapEntry)
}).strict();
export type TAuthorizeMap = z.infer<typeof TAuthorizeMap>;