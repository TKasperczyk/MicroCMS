import { ObjectId } from "mongodb";
import { z } from "zod";

import { TAuthorizeMap } from "@framework/types/communication/AuthorizeMap";

export const TServiceAuthorizeMap = z.object({
    _id: z.instanceof(ObjectId).optional(),
    serviceName: z.string(),
    authorizeMap: TAuthorizeMap
}).strict();
export type TServiceAuthorizeMap = z.input<typeof TServiceAuthorizeMap>;