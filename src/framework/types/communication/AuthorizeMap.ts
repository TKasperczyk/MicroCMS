import { z } from "zod";

export const AuthorizeMapEntry = z.object({
    hiddenReadFields: z.array(z.string()),
    forbiddenWriteFields: z.array(z.string()),
    forbiddenOperations: z.array(z.string())
}).strict();
export type AuthorizeMapEntry = z.infer<typeof AuthorizeMapEntry>;

export const AuthorizeMap = z.object({
    user: z.object({}).catchall(AuthorizeMapEntry),
    group: z.object({}).catchall(AuthorizeMapEntry)
}).strict();
export type AuthorizeMap = z.infer<typeof AuthorizeMap>;