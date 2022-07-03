import { z } from "zod";

import { TAuthorizeMapEntry } from "@framework/types/communication/AuthorizeMap";
import { TLooseObject } from "@framework/types/generic/Object";

export const TCmsMessageResponse = z.object({ 
    status: z.boolean(), 
    data: z.union([TLooseObject, z.array(TLooseObject), z.null()]), 
    error: z.string().optional(), 
    requestId: z.string(), 
    returnCode: z.number()
}).strict();
export type TCmsMessageResponse = z.infer<typeof TCmsMessageResponse>;

export const TCmsMessage = z.object({ 
    parsedQuery: TLooseObject, 
    parsedBody: TLooseObject, 
    parsedParams: TLooseObject, 
    requestId: z.string(), 
    error: TCmsMessageResponse.optional(), 
    user: TLooseObject, 
    authorizer: TAuthorizeMapEntry.optional()
}).passthrough();
export type TCmsMessage = z.infer<typeof TCmsMessage>;

export const TCmsPreMessage = z.object({ 
    requestId: z.string(), 
    user: TLooseObject
}).passthrough();
export type TCmsPreMessage = z.infer<typeof TCmsPreMessage>;