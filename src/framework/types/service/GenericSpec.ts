import { z } from "zod";

import { TRequiredDefaults } from "@framework/types/service/RequiredDefaults";

export type TGenericSpec<TGenericService> = {
    serviceId: string, 
    servicePath: string, 
    serviceValidator: z.ZodType<TGenericService>, 
    serviceRequiredDefaults: TRequiredDefaults,
    serviceIndexes: string[],
    serviceUniqueIndexes: string[]
};