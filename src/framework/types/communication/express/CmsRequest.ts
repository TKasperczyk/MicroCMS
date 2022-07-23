import { Request } from "express";
import { z } from "zod";

import { TGeneric_Data_User } from "@services/database/generic/data/user/type";

import { TLooseObject } from "@framework/types/generic/Object";

export interface TCmsPreRequest extends Request { 
    requestId?: string,
    cacheId?: string,
    user?: TGeneric_Data_User,
    serviceId?: string
}

export interface TCmsRequest extends Request { 
    requestId: string,
    cacheId: string,
    user: TGeneric_Data_User,
    serviceId: string
}

export const TCmsRequestResponse = z.object({
    status: z.boolean(), 
    data: z.union([TLooseObject, z.array(TLooseObject), z.null()]), 
    error: z.string().trim(),
    returnCode: z.number().default(200),
    fromCache: z.boolean().default(false)
}).strict();
export type TCmsRequestResponseOutput = z.output<typeof TCmsRequestResponse>;
export type TCmsRequestResponseInput = z.input<typeof TCmsRequestResponse>;
export type TCmsRequestResponse = TCmsRequestResponseInput;
