import { Request } from "express";
import { z } from "zod";

import { LooseObject } from "@framework/types/generic";

export interface CmsRequest extends Request { parsedQuery: LooseObject, parsedBody: LooseObject, parsedParams: LooseObject }

export const CmsRequestResponse = z.object({
    status: z.boolean(), 
    data: z.union([LooseObject, z.array(LooseObject), z.null()]), 
    error: z.string()
});
export type CmsRequestResponse = z.infer<typeof CmsRequestResponse>;
