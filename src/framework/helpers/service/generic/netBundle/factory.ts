import * as dotObj from "dot-object";
import { z } from "zod";

import { TLooseObject } from "@framework/types/generic";
import { TGenericFactory } from "@framework/types/service";

export const createGenericServiceFactory = 
    <TGenericService>(): TGenericFactory<TGenericService> => <TGenericServiceSchema extends z.ZodType<TGenericService>>(
        genericService: TGenericService, 
        genericServiceValidator: TGenericServiceSchema,
        requiredDefaults: Record<string, unknown> = {}, 
        includeRequired = false
    ): TGenericService => {
        if (includeRequired) {
            const dottedGenericService = dotObj.dot(genericService) as TLooseObject;
            for (const key of Object.keys(requiredDefaults)) {
                if (!dottedGenericService[key]) {
                    dottedGenericService[key] = requiredDefaults[key];
                }
            }
            genericService = dotObj.object(dottedGenericService) as unknown as TGenericService;
        }
        return genericServiceValidator.parse(genericService);
    };