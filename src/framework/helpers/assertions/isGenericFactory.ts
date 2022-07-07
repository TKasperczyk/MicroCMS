import { TGenericFactory, TFactory } from "@framework/types/service";

export const isGenericFactory = <T>(source: TGenericFactory<T> | TFactory<T>): source is TGenericFactory<T> => {
    //TFactory's length is 1 (the second param is optional). TGenericFactory takes more than one non-optional parameters
    return source.length > 1;
};