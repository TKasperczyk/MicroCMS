import { z } from "zod";

export const TAuthorizeMapEntry = z.object({
    hiddenReadFields: z.array(z.string().trim()).default([]),
    forbiddenWriteFields: z.object({
        fields: z.array(z.string().trim()),
        excludedOperations: z.array(z.string().trim()).default(["add"]),
    }).strict().default({ fields: [] }),
    forbiddenOperations: z.array(z.string().trim()).default([])
}).strict();
export type TAuthorizeMapEntry = z.input<typeof TAuthorizeMapEntry>;

export const TAuthorizeMap = z.object({
    user: z.record(z.string().trim(), TAuthorizeMapEntry).default({}),
    group: z.record(z.string().trim(), TAuthorizeMapEntry).default({})
}).strict();
export type TAuthorizeMapOutput = z.output<typeof TAuthorizeMap>;
export type TAuthorizeMapInput = z.input<typeof TAuthorizeMap>;
export type TAuthorizeMap = TAuthorizeMapInput;