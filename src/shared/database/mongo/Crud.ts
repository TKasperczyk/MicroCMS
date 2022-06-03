"use strict";

import { z } from "zod";
import { Mongo, ObjectId } from "./Mongo";

class Crud <ReturnType> {
    constructor(database: string, collection: string, validator: z.ZodType<ReturnType>) {
        this.mongo = new Mongo(database);
        this.collection = collection;
        this.validator = validator;
    };

    private mongo: Mongo;
    private collection: string;
    private validator: z.ZodType<ReturnType>;

    public async get(id: string): Promise<ReturnType | null> {
        try {
            const connection = await this.mongo.getConnection();
            const mongoId = new ObjectId(id);
            const document = await connection.collection(this.collection).findOne(mongoId);
            if (!document){
                return null;
            }
            let result: ReturnType;
            try {
                result = this.validator.parse(document);
            } catch (error) {
                const errorMessage = `Error while conforming a query result to the provided type: ${error}`;
                throw new Error(errorMessage);
            }
            return result;
        } catch (error) {
            const errorMessage = `Error while executing a GET query: ${error} - ${id.toString()}`;
            throw new Error(errorMessage);
        }
    };
    /*public async search(query: string): Promise<NetBundle[]> { return [newNetBundle]; };
    public async add(netBundle: NetBundle): Promise<NetBundle> { return newNetBundle; };
    public async update(id: number, netBundle: NetBundle): Promise<NetBundle> { return newNetBundle; };
    public async delete(id: number): Promise<boolean> { return newNetBundle; };*/
};

export { Crud };