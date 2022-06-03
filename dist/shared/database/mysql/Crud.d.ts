import { z } from "zod";
declare class Crud<ReturnType> {
    constructor(database: string, table: string, validator: z.ZodType<ReturnType>);
    private mysql;
    private table;
    private validator;
    get(id: number): Promise<ReturnType | null>;
}
export { Crud };
