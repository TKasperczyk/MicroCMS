import { z } from "zod";

import { Mysql } from "./Mysql";

//TODO: this class isn't finished

class Crud {
    constructor(database: string, table: string, validator: z.ZodTypeAny) {
        this.mysql = new Mysql(database);
        this.table = table;
        this.validator = validator;
    }

    private mysql: Mysql;
    private table: string;
    private validator: z.ZodTypeAny;

    /*public async get(id: number): Promise<TReturn | null> {
        const query = `SELECT * FROM ${this.table} WHERE id = ?;`;
        try {
            const [rows] = await this.mysql.query(query, [id]);
            if (!rows || !rows.length) {
                return null;
            }
            let result: TReturn;
            try {
                result = this.validator.parse(rows[0]);
            } catch (error) {
                const errorMessage = `Error while conforming a query result to the provided type: ${error}`;
                throw new Error(errorMessage);
            }
            return result;
        } catch (error) {
            const errorMessage = `Error while executing a GET query: ${error} - ${query}`;
            throw new Error(errorMessage);
        }
    }
    public async search(query: string): Promise<NetBundle[]> { return [newNetBundle]; };
    public async add(netBundle: NetBundle): Promise<NetBundle> { return newNetBundle; };
    public async update(id: number, netBundle: NetBundle): Promise<NetBundle> { return newNetBundle; };
    public async delete(id: number): Promise<boolean> { return newNetBundle; };*/
}

export { Crud };