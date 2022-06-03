"use strict";

import { z } from "zod";
import { Mysql } from "./Mysql";

class Crud <ReturnType> {
    constructor(database: string, table: string, validator: z.ZodType<ReturnType>) {
        this.mysql = new Mysql(database);
        this.table = table;
        this.validator = validator;
    };

    private mysql: Mysql;
    private table: string;
    private validator: z.ZodType<ReturnType>;

    public async get(id: number): Promise<ReturnType | null> {
        const query = `SELECT * FROM ${this.table} WHERE id = ?;`;
        try {
            const [rows] = await this.mysql.query(query, [id]);
            if (!rows || !rows.length){
                return null;
            }
            let result: ReturnType;
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
    };
    /*public async search(query: string): Promise<NetBundle[]> { return [newNetBundle]; };
    public async add(netBundle: NetBundle): Promise<NetBundle> { return newNetBundle; };
    public async update(id: number, netBundle: NetBundle): Promise<NetBundle> { return newNetBundle; };
    public async delete(id: number): Promise<boolean> { return newNetBundle; };*/
};

export { Crud };