"use strict";

import { z } from "zod";
import { Mongo, ObjectId, Sort } from "./Mongo";
import { LooseObject, CrudRoutes } from "../../types/index";

class Crud <ReturnType> implements CrudRoutes {
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
            try {
                const result: ReturnType = this.validator.parse(document);
                return result;
            } catch (error) {
                const errorMessage = `Error while conforming a query result to the provided type: ${error}`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            const errorMessage = `Error while executing a get query: ${error} - ${id.toString()}`;
            throw new Error(errorMessage);
        }
    };
    public async search({ query, sort = {}, page = 0, pageSize = 10, limit = 0 }: { query: LooseObject, sort?: Sort, page?: number, pageSize?: number, limit?: number }): Promise<ReturnType[]> {
        try {
            if (page > 0 && limit > 0){
                throw new Error("Paging and limiting are mutually exclusive in the Mongo search function");
            }

            const connection = await this.mongo.getConnection();
            let cursor = connection.collection(this.collection).find(query);

            const shouldSort = Object.keys(sort).length > 0;
            if (shouldSort){
                cursor = cursor.sort(sort);
            }
            if (page > 0){
                if (!shouldSort){
                    cursor = cursor.sort({_id: -1});
                }
                const skip = page - 1 * pageSize;
                cursor = cursor.skip(skip).limit(pageSize);
            } else if (limit > 0){
                cursor = cursor.limit(limit);
            }

            try {
                const result: ReturnType[] = [];
                await cursor.forEach((document) => {
                    const parsedDocument: ReturnType = this.validator.parse(document);
                    result.push(parsedDocument);
                });
                return result;
            } catch (error) {
                const errorMessage = `Error while conforming a query result to the provided type: ${error} - ${JSON.stringify(query)}`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            const errorMessage = `Error while executing a search query: ${error} - ${JSON.stringify(query)}`;
            throw new Error(errorMessage);
        }
    };
    public async aggregate(pipeline: LooseObject[]): Promise<LooseObject[]> {
        try {
            const connection = await this.mongo.getConnection();
            const cursor = connection.collection(this.collection).aggregate(pipeline);

            try {
                const result: LooseObject[] = [];
                await cursor.forEach((document) => {
                    const parsedDocument: LooseObject = this.validator.parse(document);
                    result.push(parsedDocument);
                });
                return result;
            } catch (error) {
                const errorMessage = `Error while conforming a query result to the provided type: ${error} - ${JSON.stringify(pipeline)}`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            const errorMessage = `Error while executing an aggregate query: ${error} - ${JSON.stringify(pipeline)}`;
            throw new Error(errorMessage);
        }
    };
    public async add(documentToAdd: ReturnType): Promise<ReturnType> {
        try {
            const connection = await this.mongo.getConnection();
            const _id = await connection.collection(this.collection).insertOne(documentToAdd);

            try {
                const result: ReturnType = this.validator.parse({...documentToAdd, _id});
                return result;
            } catch (error) {
                const errorMessage = `Error while conforming a query result to the provided type: ${error} - ${JSON.stringify(documentToAdd)}`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            const errorMessage = `Error while executing an add query: ${error} - ${JSON.stringify(documentToAdd)}`;
            throw new Error(errorMessage);
        }
    };
    public async update(id: string, documentToUpdate: ReturnType): Promise<ReturnType> {
        try {
            const connection = await this.mongo.getConnection();
            const mongoId = new ObjectId(id);
            const updatedDocument = await connection.collection(this.collection).findOneAndUpdate({_id: mongoId}, {$set: documentToUpdate}, {returnDocument: "after"});

            try {
                const result: ReturnType = this.validator.parse(updatedDocument);
                return result;
            } catch (error) {
                const errorMessage = `Error while conforming a query result to the provided type: ${error} - ${JSON.stringify(updatedDocument)}`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            const errorMessage = `Error while executing an add query: ${error} - ${JSON.stringify(documentToUpdate)}`;
            throw new Error(errorMessage);
        }
    };
    public async delete(id: string): Promise<boolean> {
        try {
            const connection = await this.mongo.getConnection();
            const mongoId = new ObjectId(id);
            const deletedDocument = await connection.collection(this.collection).deleteOne({_id: mongoId});
            return deletedDocument?.deletedCount === 1;
        } catch (error) {
            const errorMessage = `Error while executing an add query: ${error} - ${JSON.stringify(id)}`;
            throw new Error(errorMessage);
        }
    };
};

export { Crud };