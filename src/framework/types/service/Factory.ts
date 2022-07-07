import { z } from "zod";

import { TRequiredDefaults } from "@framework/types/service/RequiredDefaults";

export type TFactory<TReturn> = (input: TReturn, includeRequired?: boolean) => TReturn;
export type TGenericFactory<TReturn> = <TReturnSchema extends z.ZodType<TReturn>>(input: TReturn, validator: TReturnSchema, requiredDefaults: TRequiredDefaults, includeRequired?: boolean) => TReturn;