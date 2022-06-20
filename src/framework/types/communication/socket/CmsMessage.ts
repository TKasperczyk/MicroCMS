import { AuthorizeMapEntry } from "@framework/types/communication";
import { LooseObject } from "@framework/types/generic";


export interface CmsMessage { parsedQuery: LooseObject, parsedBody: LooseObject, parsedParams: LooseObject, id: string, error: CmsMessageResponse, user: LooseObject, authorizer: AuthorizeMapEntry }
export interface CmsMessageResponse { status: boolean, data: LooseObject | LooseObject[] | null, error: string, id: string, returnCode: number }
