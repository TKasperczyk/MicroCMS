import { ObjectId } from "mongodb";
import { z } from "zod";

import { TAuthorizeMap } from "@framework/types/communication/AuthorizeMap";
import { TRequiredDefaults, TUpdateSpec } from "@framework/types/service";

export const TCore_ServiceAuthorizeMap = z.object({
    _id: z.instanceof(ObjectId).optional(),
    serviceId: z.string(),
    authorizeMap: TAuthorizeMap
}).strict();
export type TCore_ServiceAuthorizeMap = z.input<typeof TCore_ServiceAuthorizeMap>;

export const core_serviceAuthorizerMapRequiredDefaults: TRequiredDefaults = {
    "serviceId": "",
    "authorizeMap": {}
};

export const core_serviceAuthorizerMapUpdateSpecs: TUpdateSpec[] = [];