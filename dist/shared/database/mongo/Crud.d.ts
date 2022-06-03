import { z } from "zod";
declare class Crud<ReturnType> {
    constructor(database: string, collection: string, validator: z.ZodType<ReturnType>);
    private mongo;
    private collection;
    private validator;
    get(id: string): Promise<ReturnType | null>;
}
export { Crud };
