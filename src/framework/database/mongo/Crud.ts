import * as dotObj from "dot-object";
import { z } from "zod";

import { ApiResult } from "@framework/types/communication";
import { CrudOperations } from "@framework/types/database";
import { LooseObject } from "@framework/types/generic";
import { Factory } from "@framework/types/service";

import { Mongo, ObjectId, Sort } from "./Mongo";

class Crud<ReturnType> implements CrudOperations {
    /**
     * 
     * @param database - the name of the database
     * @param collection - the name of the collection
     * @param validator - the ZOD type that allows to parse objects
     * @param factory - the function that produces a new ReturnType with default values
     * @param indexes - a list of fields that should be indexed
     * @param uniqueIndexes - a list of fields that should be unique
     * @param autoIncrementField - a list of fields that should be auto-incremented
     */
    constructor(
        database: string, collection: string,
        validator: z.ZodTypeAny, factory: Factory<ReturnType>,
        indexes: string[], uniqueIndexes: string[], autoIncrementField: null | string = null
    ) {
        this.mongo = new Mongo(database);
        this.collection = collection;
        this.validator = validator;
        this.factory = factory;
        this.indexes = indexes;
        this.uniqueIndexes = uniqueIndexes;
        this.autoIncrementField = autoIncrementField;
    }

    private mongo: Mongo;
    private collection: string;
    private validator: z.ZodTypeAny;
    private factory: Factory<ReturnType>;
    private indexes: string[];
    private uniqueIndexes: string[];
    private autoIncrementField: null | string;

    /**
     * Must be called before using any other methods. Creates the connection and indexes
     */
    public async init(): Promise<void> {
        const connection = await this.mongo.getConnection();
        for (const index of this.indexes) {
            await connection.collection(this.collection).createIndex(index);
        }
        for (const uniqueIndex of this.uniqueIndexes) {
            await connection.collection(this.collection).createIndex(uniqueIndex, { unique: true });
        }
    }
    
    /**
     * Searches the database and returns an array of results. Parses each document and throws an error if any of them isn't compliant with the provided type
     * @param {object} arg
     * @param arg.query - the query object that will be passed to mongo
     * @param arg.sort = {} - the sort object compliant with the Sort type - [key as string]: number
     * @param arg.page = 0 - if greater than zero, you must also specify the pageSize parameter. Skips the provided number of results
     * @param arg.pageSize = 0 - determines how big each page should be. page = 0 and pageSize >=0 is a valid combination
     * @param arg.limit = 0 - limits the number of results to the provided value. Cannot be used with paging
     * @returns an array of parsed documents
     * @throws when both pageSize and limit are greater than 0, when at least one of the retrieved documents can't be parsed by the validator, when there's a mongo execution error
     */
    public async search({ query, sort = {}, page = 0, pageSize = 10, limit = 0 }: { query: LooseObject, sort?: Sort, page?: number, pageSize?: number, limit?: number }): Promise<ReturnType[]> {
        try {
            if (pageSize > 0 && limit > 0) {
                throw new Error("Paging and limiting are mutually exclusive in the Mongo search function");
            }

            const connection = await this.mongo.getConnection();
            //The cursor will be overwritten by the search options
            let cursor = connection.collection(this.collection).find(query);

            const shouldSort = Object.keys(sort).length > 0;
            if (shouldSort) {
                cursor = cursor.sort(sort);
            }
            if (pageSize > 0) {
                const skip = pageSize * Math.max((page - 1), 0);
                cursor = cursor.skip(skip).limit(pageSize);
            } else if (limit > 0) {
                cursor = cursor.limit(limit);
            }

            try {
                const result: ReturnType[] = [];
                await cursor.forEach((document) => {
                    const parsedDocument: ReturnType = this.validator.parse(document) as ReturnType;
                    result.push(parsedDocument);
                });
                return result;
            } catch (error) {
                const errorMessage = `Error while conforming a query result to the provided type: ${String(error)} - ${JSON.stringify(query)}`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            const errorMessage = `Error while executing a search query: ${String(error)} - ${JSON.stringify(query)}`;
            throw new Error(errorMessage);
        }
    }
    public async aggregate(pipeline: LooseObject[]): Promise<ReturnType[]> {
        try {
            const connection = await this.mongo.getConnection();
            const cursor = connection.collection(this.collection).aggregate(pipeline);

            try {
                const result: ReturnType[] = [];
                await cursor.forEach((document) => {
                    const parsedDocument: ReturnType = document as ReturnType;
                    result.push(parsedDocument);
                });
                return result;
            } catch (error) {
                const errorMessage = `Error while conforming a query result to the provided type: ${String(error)} - ${JSON.stringify(pipeline)}`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            const errorMessage = `Error while executing an aggregate query: ${String(error)} - ${JSON.stringify(pipeline)}`;
            throw new Error(errorMessage);
        }
    }
    public async get(id: string): Promise<ApiResult<ReturnType> | null> {
        try {
            const connection = await this.mongo.getConnection();
            if (id) {
                const mongoId = new ObjectId(id);
                const document = await connection.collection(this.collection).findOne(mongoId);
                if (!document) {
                    return null;
                }
                try {
                    const result: ReturnType = this.validator.parse(document) as ReturnType;
                    return result;
                } catch (error) {
                    const errorMessage = `Error while conforming a query result to the provided type: ${String(error)}`;
                    throw new Error(errorMessage);
                }
            } else {
                const documents = await connection.collection(this.collection).find().toArray();
                if (!documents) {
                    return null;
                }
                try {
                    const result: ReturnType[] = documents.map((document) => {
                        return this.validator.parse(document) as ReturnType;
                    });
                    return result;
                } catch (error) {
                    const errorMessage = `Error while conforming a query result to the provided type: ${String(error)}`;
                    throw new Error(errorMessage);
                }
            }
        } catch (error) {
            const errorMessage = `Error while executing a get query: ${String(error)} - ${id.toString()}`;
            throw new Error(errorMessage);
        }
    }
    public async add(documentToAdd: ReturnType): Promise<ReturnType> {
        try {
            let documentFromFactory = documentToAdd;
            try {
                documentFromFactory = this.factory(documentToAdd);
            } catch (error) {
                const errorMessage = `Error while parsing the incoming object: ${String(error)} - ${JSON.stringify(documentToAdd)}`;
                throw new Error(errorMessage);
            }
            const connection = await this.mongo.getConnection();
            if (this.autoIncrementField) {
                const autoIncrementKey = this.autoIncrementField as keyof ReturnType;
                if (typeof documentFromFactory[autoIncrementKey] !== "number") {
                    const errorMessage = `The factory didn't produce an object with a proper autoincrement field: ${this.autoIncrementField}: ${JSON.stringify(documentFromFactory)}`;
                    throw new Error(errorMessage);
                }

                const latestIndex: LooseObject[] = await connection.collection(this.collection).find().project({ [this.autoIncrementField]: 1 }).sort({ [this.autoIncrementField]: -1 }).limit(1).toArray();
                if (latestIndex && latestIndex.length && typeof latestIndex[0][this.autoIncrementField] === "number") {
                    (documentFromFactory[autoIncrementKey] as unknown) = (latestIndex[0][this.autoIncrementField] as number) + 1;
                } else {
                    (documentFromFactory[autoIncrementKey] as unknown) = 0;
                }
            }
            const insertResult = await connection.collection(this.collection).insertOne(documentFromFactory);
            try {
                const result: ReturnType = this.validator.parse({ ...documentFromFactory, _id: insertResult.insertedId }) as ReturnType;
                return result;
            } catch (error) {
                const errorMessage = `Error while conforming a query result to the provided type: ${String(error)} - ${JSON.stringify(documentToAdd)}`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            const errorMessage = `Error while executing an add query: ${String(error)} - ${JSON.stringify(documentToAdd)}`;
            throw new Error(errorMessage);
        }
    }
    public async update(id: string, documentToUpdate: ReturnType): Promise<ReturnType | null> {
        try {
            const connection = await this.mongo.getConnection();
            const mongoId = new ObjectId(id);
            const documentFromFactory = this.factory(documentToUpdate, true);
            try {
                this.validator.parse(documentFromFactory);
            } catch (error) {
                const errorMessage = `Error while parsing the incoming object: ${String(error)} - ${JSON.stringify(documentToUpdate)}`;
                throw new Error(errorMessage);
            }
            const dDocumentFromFactory = dotObj.dot(documentFromFactory) as LooseObject;
            const dDocumentToUpdate = dotObj.dot(documentToUpdate) as LooseObject;
            for (const key of Object.keys(dDocumentToUpdate)) {
                dDocumentToUpdate[key] = dDocumentFromFactory[key] as LooseObject;
            }
            const { value } = await connection.collection(this.collection).findOneAndUpdate({ _id: mongoId }, { $set: dotObj.object(dDocumentToUpdate) }, { upsert: false, returnDocument: "after" });
            if (value === null) {
                return null;
            }
            try {
                const result: ReturnType = this.validator.parse(value) as ReturnType;
                return result;
            } catch (error) {
                const errorMessage = `Error while conforming a query result to the provided type: ${String(error)} - ${JSON.stringify(value)}`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            const errorMessage = `Error while executing an update query: ${String(error)} - ${JSON.stringify(documentToUpdate)}`;
            throw new Error(errorMessage);
        }
    }
    public async delete(id: string): Promise<boolean> {
        try {
            const connection = await this.mongo.getConnection();
            const mongoId = new ObjectId(id);
            const deletedDocument = await connection.collection(this.collection).deleteOne({ _id: mongoId });
            return deletedDocument?.deletedCount === 1;
        } catch (error) {
            const errorMessage = `Error while executing an add query: ${String(error)} - ${JSON.stringify(id)}`;
            throw new Error(errorMessage);
        }
    }
}

export { Crud };