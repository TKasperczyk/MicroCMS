import { z } from "zod";
import { Sort } from "./Mongo";
import { LooseObject, CrudRoutes } from "../../types/index";
declare class Crud<ReturnType> implements CrudRoutes {
    constructor(database: string, collection: string, validator: z.ZodType<ReturnType>);
    private mongo;
    private collection;
    private validator;
    get(id: string): Promise<ReturnType | null>;
    search({ query, sort, page, pageSize, limit }: {
        query: LooseObject;
        sort?: Sort;
        page?: number;
        pageSize?: number;
        limit?: number;
    }): Promise<ReturnType[]>;
    aggregate(pipeline: LooseObject[]): Promise<LooseObject[]>;
    add(documentToAdd: ReturnType): Promise<ReturnType>;
    update(id: string, documentToUpdate: ReturnType): Promise<ReturnType>;
    delete(id: string): Promise<boolean>;
}
export { Crud };
