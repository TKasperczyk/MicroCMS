import { z } from "zod";

import { AuthorizeMapEntry } from "@framework/types/communication";
import { LooseObject } from "@framework/types/generic";

export const CmsMessageResponse = z.object({ 
    status: z.boolean(), 
    data: z.union([LooseObject, z.array(LooseObject), z.null()]), 
    error: z.string().optional(), 
    requestId: z.string(), 
    returnCode: z.number()
}).strict();
export type CmsMessageResponse = z.infer<typeof CmsMessageResponse>;

export const CmsMessage = z.object({ 
    parsedQuery: LooseObject, 
    parsedBody: LooseObject, 
    parsedParams: LooseObject, 
    requestId: z.string(), 
    error: CmsMessageResponse.optional(), 
    user: LooseObject, 
    authorizer: AuthorizeMapEntry.optional()
}).passthrough();
export type CmsMessage = z.infer<typeof CmsMessage>;

export const CmsPreMessage = z.object({ 
    requestId: z.string(), 
    user: LooseObject
}).passthrough();
export type CmsPreMessage = z.infer<typeof CmsPreMessage>;