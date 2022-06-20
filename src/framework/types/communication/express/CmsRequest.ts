import { Request } from "express";

import { LooseObject } from "@framework/types/generic";

export interface CmsRequest extends Request { parsedQuery: LooseObject, parsedBody: LooseObject, parsedParams: LooseObject }
export interface CmsRequestResponse { status: boolean, data: LooseObject | LooseObject[] | null, error: string }