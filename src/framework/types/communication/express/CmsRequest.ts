import { Request } from "express";
import { z } from "zod";

import { TLooseObject } from "@framework/types/generic/Object";

export interface TCmsRequest extends Request { parsedQuery: TLooseObject, parsedBody: TLooseObject, parsedParams: TLooseObject }

export const TCmsRequestResponse = z.object({
    status: z.boolean(), 
    data: z.union([TLooseObject, z.array(TLooseObject), z.null()]), 
    error: z.string()
});
export type TCmsRequestResponse = z.input<typeof TCmsRequestResponse>;
