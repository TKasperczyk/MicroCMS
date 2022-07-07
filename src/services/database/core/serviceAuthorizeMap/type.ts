import { ObjectId } from "mongodb";
import { z } from "zod";

import { TAuthorizeMap } from "@framework/types/communication/AuthorizeMap";
import { TRequiredDefaults } from "@framework/types/service";

export const TServiceAuthorizeMap = z.object({
    _id: z.instanceof(ObjectId).optional(),
    serviceId: z.string(),
    authorizeMap: TAuthorizeMap
}).strict();
export type TServiceAuthorizeMap = z.input<typeof TServiceAuthorizeMap>;

export const requiredDefaults: TRequiredDefaults = {
    "serviceId": "",
    "authorizeMap": {}
};