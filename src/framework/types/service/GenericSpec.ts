import { z } from "zod";

import { TCollectionIndex } from "@framework/types/database/mongo";
import { TRequiredDefaults } from "@framework/types/service/RequiredDefaults";
import { TUpdateSpec } from "@framework/types/service/UpdateSpec";

export type TGenericSpec<TGenericService> = {
    serviceId: string, 
    servicePath: string, 
    serviceValidator: z.ZodType<TGenericService>, 
    serviceRequiredDefaults: TRequiredDefaults,
    serviceUpdateSpecs: TUpdateSpec[],
    serviceIndexes: TCollectionIndex[]
};