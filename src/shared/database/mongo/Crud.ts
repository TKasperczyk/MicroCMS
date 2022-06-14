"use strict";

import { z } from "zod";
import * as dotObj from "dot-object";
import { Mongo, ObjectId, Sort } from "./Mongo";
import { LooseObject, CrudRoutes, ServiceFactory } from "../../types/index";

class Crud<ReturnType> implements CrudRoutes {
    constructor(
        database: string, collection: string,
        validator: z.ZodTypeAny, factory: ServiceFactory<ReturnType>,
        indexes: string[], uniqueIndexes: string[], autoIncrementField: null | string = null
    ) {
        this.mongo = new Mongo(database);
        this.collection = collection;
        this.validator = validator;
        this.factory = factory;
        this.indexes = indexes;
        this.uniqueIndexes = uniqueIndexes;
        this.autoIncrementField = autoIncrementField;
    };

    private mongo: Mongo;
    private collection: string;
    private validator: z.ZodTypeAny;
    private factory: ServiceFactory<ReturnType>;
    private indexes: string[];
    private uniqueIndexes: string[];
    private autoIncrementField: null | string;

    public async init(): Promise<void> {
        const connection = await this.mongo.getConnection();
        for (const index of this.indexes) {
            await connection.collection(this.collection).createIndex(index);
        }
        for (const uniqueIndex of this.uniqueIndexes) {
            await connection.collection(this.collection).createIndex(uniqueIndex, { unique: true });
        }
    };
    public async search({ query, sort = {}, page = 0, pageSize = 10, limit = 0 }: { query: LooseObject, sort?: Sort, page?: number, pageSize?: number, limit?: number }): Promise<ReturnType[]> {
        try {
            if (page > 0 && limit > 0) {
                throw new Error("Paging and limiting are mutually exclusive in the Mongo search function");
            }

            const connection = await this.mongo.getConnection();
            let cursor = connection.collection(this.collection).find(query);

            const shouldSort = Object.keys(sort).length > 0;
            if (shouldSort) {
                cursor = cursor.sort(sort);
            }
            if (page > 0) {
                const skip = pageSize * Math.max((page - 1), 0);
                cursor = cursor.skip(skip).limit(pageSize);
            } else if (limit > 0) {
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
                    const parsedDocument: LooseObject = document;
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
    public async get(id: string): Promise<ReturnType | ReturnType[] | null> {
        try {
            const connection = await this.mongo.getConnection();
            if (id) {
                const mongoId = new ObjectId(id);
                const document = await connection.collection(this.collection).findOne(mongoId);
                if (!document) {
                    return null;
                }
                try {
                    const result: ReturnType = this.validator.parse(document);
                    return result;
                } catch (error) {
                    const errorMessage = `Error while conforming a query result to the provided type: ${error}`;
                    throw new Error(errorMessage);
                }
            } else {
                const documents = await connection.collection(this.collection).find().toArray();
                if (!documents) {
                    return null;
                }
                try {
                    const result: ReturnType[] = documents.map((document) => {
                        return this.validator.parse(document);
                    });
                    return result;
                } catch (error) {
                    const errorMessage = `Error while conforming a query result to the provided type: ${error}`;
                    throw new Error(errorMessage);
                }
            }
        } catch (error) {
            const errorMessage = `Error while executing a get query: ${error} - ${id.toString()}`;
            throw new Error(errorMessage);
        }
    };
    public async add(documentToAdd: ReturnType): Promise<ReturnType> {
        try {
            let documentFromFactory = documentToAdd;
            try {
                documentFromFactory = this.factory(documentToAdd);
            } catch (error) {
                const errorMessage = `Error while parsing the incoming object: ${error} - ${JSON.stringify(documentToAdd)}`;
                throw new Error(errorMessage);
            }
            const connection = await this.mongo.getConnection();
            if (this.autoIncrementField) {
                const latestIndex: LooseObject[] = await connection.collection(this.collection).find().project({[this.autoIncrementField]: 1}).sort({ [this.autoIncrementField]: -1 }).limit(1).toArray();
                if (latestIndex && latestIndex.length && typeof latestIndex[0][this.autoIncrementField] === "number") {
                    documentFromFactory[this.autoIncrementField as keyof ReturnType] = latestIndex[0][this.autoIncrementField] + 1;
                } else {
                    documentFromFactory[this.autoIncrementField as keyof ReturnType] = 0 as any;
                }
            }
            const insertResult = await connection.collection(this.collection).insertOne(documentFromFactory);
            try {
                const result: ReturnType = this.validator.parse({ ...documentFromFactory, _id: insertResult.insertedId });
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
    public async update(id: string, documentToUpdate: ReturnType): Promise<ReturnType | null> {
        try {
            const connection = await this.mongo.getConnection();
            const mongoId = new ObjectId(id);
            const documentFromFactory = this.factory(documentToUpdate, true);
            try {
                this.validator.parse(documentFromFactory);
            } catch (error) {
                const errorMessage = `Error while parsing the incoming object: ${error} - ${JSON.stringify(documentToUpdate)}`;
                throw new Error(errorMessage);
            }
            const dDocumentFromFactory = dotObj.dot(documentFromFactory);
            const dDocumentToUpdate = dotObj.dot(documentToUpdate);
            for (const key of Object.keys(dDocumentToUpdate)){
                dDocumentToUpdate[key] = dDocumentFromFactory[key];
            }
            const { value } = await connection.collection(this.collection).findOneAndUpdate({ _id: mongoId }, { $set: dotObj.object(dDocumentToUpdate) }, { upsert: false, returnDocument: "after" });
            if (value === null){
                return null;
            }
            try {
                const result: ReturnType = this.validator.parse(value);
                return result;
            } catch (error) {
                const errorMessage = `Error while conforming a query result to the provided type: ${error} - ${JSON.stringify(value)}`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            const errorMessage = `Error while executing an update query: ${error} - ${JSON.stringify(documentToUpdate)}`;
            throw new Error(errorMessage);
        }
    };
    public async delete(id: string): Promise<boolean> {
        try {
            const connection = await this.mongo.getConnection();
            const mongoId = new ObjectId(id);
            const deletedDocument = await connection.collection(this.collection).deleteOne({ _id: mongoId });
            return deletedDocument?.deletedCount === 1;
        } catch (error) {
            const errorMessage = `Error while executing an add query: ${error} - ${JSON.stringify(id)}`;
            throw new Error(errorMessage);
        }
    };
};

export { Crud };