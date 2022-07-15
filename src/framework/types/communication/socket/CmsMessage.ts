import { z } from "zod";

import { TData_User } from "@services/database/generic/data/user/type";

import { TAuthorizeMapEntry } from "@framework/types/communication/AuthorizeMap";
import { TLooseObject } from "@framework/types/generic/Object";

export const TCmsMessageResponse = z.object({ 
    status: z.boolean(), 
    data: z.union([TLooseObject, z.array(TLooseObject), z.null()]), 
    error: z.string().optional(), 
    requestId: z.string(), 
    returnCode: z.number()
}).strict();
export type TCmsMessageResponse = z.input<typeof TCmsMessageResponse>;

export const TCmsMessage = z.object({ 
    parsedQuery: TLooseObject, 
    parsedBody: TLooseObject, 
    parsedParams: TLooseObject, 
    requestId: z.string(), 
    error: TCmsMessageResponse.optional(), 
    user: TData_User, 
    authorizer: TAuthorizeMapEntry.optional()
}).passthrough();
export type TCmsMessage = z.input<typeof TCmsMessage>;

export const TCmsPreMessage = z.object({ 
    requestId: z.string(), 
    cacheId: z.string().optional(),
    user: TData_User
}).passthrough();
export type TCmsPreMessage = z.input<typeof TCmsPreMessage>;