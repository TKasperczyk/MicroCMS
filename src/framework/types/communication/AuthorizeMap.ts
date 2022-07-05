import { z } from "zod";

export const TAuthorizeMapEntry = z.object({
    hiddenReadFields: z.array(z.string()).default([]),
    forbiddenWriteFields: z.object({
        fields: z.array(z.string()),
        excludedOperations: z.array(z.string()).default(["add"]),
    }).default({ fields: [] }),
    forbiddenOperations: z.array(z.string()).default([])
}).strict();
export type TAuthorizeMapEntry = z.input<typeof TAuthorizeMapEntry>;

export const TAuthorizeMap = z.object({
    user: z.record(z.string(), TAuthorizeMapEntry),
    group: z.record(z.string(), TAuthorizeMapEntry)
}).strict();
export type TAuthorizeMap = z.input<typeof TAuthorizeMap>;