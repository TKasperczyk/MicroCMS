import { z } from "zod";

export type TFactory<TReturn> = (input: TReturn, includeRequired?: boolean) => TReturn;
export type TGenericFactory<TReturn> = <TReturnSchema extends z.ZodType<TReturn>>(input: TReturn, validator: TReturnSchema, requiredDefaults: Record<string, unknown>, includeRequired?: boolean) => TReturn;