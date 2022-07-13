import { randomUUID } from "crypto";

import * as dotObj from "dot-object";
import { ObjectId, Sort, FindCursor, WithId, Document } from "mongodb";
import { Logger, LoggerOptions } from "pino";
import { z } from "zod";

import { getErrorMessage } from "@framework/helpers";
import { isGenericFactory } from "@framework/helpers/assertions";
import { perfLogger } from "@framework/logger";

import { TApiResult } from "@framework/types/communication";
import { TCrudOperations } from "@framework/types/database";
import { TLooseObject } from "@framework/types/generic";
import { TFactory, TGenericFactory, TRequiredDefaults } from "@framework/types/service";
import { TUpdateSpec } from "@framework/types/service/UpdateSpec";

import { Mongo } from "./Mongo";

export class Crud<TReturn extends { _id?: ObjectId }> implements TCrudOperations<unknown> {
    /**
     * 
     * @param database - the name of the database
     * @param collection - the name of the collection
     * @param validator - the ZOD type that allows to parse objects
     * @param factory - the function that produces a new TReturn with default values
     * @param requiredDefaults - the list of dotted required fields with their default values
     * @param updateSpecs - a list of specifications of the associated objects that should be updated along with this one
     * @param indexes - a list of fields that should be indexed
     * @param uniqueIndexes - a list of fields that should be unique
     * @param autoIncrementField - a list of fields that should be auto-incremented
     */
    constructor(
        database: string, collection: string,
        validator: z.ZodType<TReturn>, factory: TGenericFactory<TReturn> | TFactory<TReturn>, 
        requiredDefaults: TRequiredDefaults = {}, updateSpecs: TUpdateSpec[] = [],
        indexes: string[] = [], uniqueIndexes: string[] = [], autoIncrementField: null | string = null,
    ) {
        this.mongo = new Mongo(database);
        this.collection = collection;
        this.validator = validator;
        this.factory = factory;
        this.requiredDefaults = requiredDefaults;
        this.indexes = indexes;
        this.uniqueIndexes = uniqueIndexes;
        this.autoIncrementField = autoIncrementField;
        this.updateSpecs = updateSpecs;

        this.pf = perfLogger(`Crud[${collection}]`);
    }

    private mongo: Mongo;
    private collection: string;
    private validator: z.ZodType<TReturn>;
    private factory: TGenericFactory<TReturn> | TFactory<TReturn>;
    private requiredDefaults: TRequiredDefaults;
    private indexes: string[];
    private uniqueIndexes: string[];
    private autoIncrementField: null | string;
    private updateSpecs: TUpdateSpec[];
    private pf: Logger<LoggerOptions>;

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
     * Searches the database and returns an array of results. Parses each document
     * @param {object} arg
     * @param arg.query - the query object that will be passed to mongo
     * @param arg.sort = {} - the sort object compliant with the Sort type - [key as string]: number
     * @param arg.page = 0 - if greater than zero, you must also specify the pageSize parameter. Skips the provided number of results
     * @param arg.pageSize = 0 - determines how big each page should be. page = 0 and pageSize >=0 is a valid combination
     * @param arg.limit = 0 - limits the number of results to the provided value. Cannot be used with paging
     * @returns an array of parsed documents
     * @throws when both pageSize and limit are greater than 0, when at least one of the retrieved documents can't be parsed by the validator, when there's a mongo execution error
     */
    public async search({ query, sort = {}, page = 0, pageSize = 0, limit = 0 }: { query: TLooseObject, sort?: Sort, page?: number, pageSize?: number, limit?: number }): Promise<TReturn[]> {
        try {
            const uuid = randomUUID();
            this.pf.trace({ uuid, query, sort, page, pageSize, limit }, "Search began");
            if (pageSize > 0 && limit > 0) {
                throw new Error("Paging and limiting are mutually exclusive in the Mongo search function");
            }

            const connection = await this.mongo.getConnection();
            let cursor = connection.collection(this.collection).find(query);
            cursor = this.applyCursorOptions(cursor, sort, page, pageSize, limit);

            try {
                const result: TReturn[] = [];
                await cursor.forEach((document) => {
                    const parsedDocument: TReturn = this.validator.parse(document);
                    result.push(parsedDocument);
                });
                this.pf.trace({ uuid }, "Search finished");
                return result;
            } catch (error) {
                throw new Error(`Error while conforming a query result to the provided type: ${getErrorMessage(error)} - ${JSON.stringify(query)}`);
            }
        } catch (error) {
            throw new Error(`Error while executing a search query: ${getErrorMessage(error)} - ${JSON.stringify(query)}`);
        }
    }
    /**
     * Searches the database by using an aggregation pipeline, doesn't parse the output because of possible transformations, which introduces a security risk in terms of Auth.hiddenFields -- TOFIX
     * @param pipeline - the aggregation pipeline that will be passed to the aggregate function
     * @returns an array of documents
     * @throws when there's a mongo execution error
     */
    public async aggregate(pipeline: TLooseObject[]): Promise<TReturn[]> {
        try {
            const uuid = randomUUID();
            this.pf.trace({ uuid, pipeline }, "Aggregate began");
            const connection = await this.mongo.getConnection();
            const cursor = connection.collection(this.collection).aggregate(pipeline);

            const result: TReturn[] = [];
            await cursor.forEach((document) => {
                // This is wrong - the doc isn't a TReturn, but changing that to TLooseObject would break other classes like ApiCall
                result.push(document as TReturn);
            });
            this.pf.trace({ uuid }, "Aggregate finished");
            return result;
        } catch (error) {
            throw new Error(`Error while executing an aggregate query: ${getErrorMessage(error)} - ${JSON.stringify(pipeline)}`);
        }
    }
    /**
     * Returns either one document with the provided id or every document if the id isn't provided. Parses each document
     * @param id = "" - the id of the document that should be returned
     * @returns a single document, an array of documents or null if there are no documents with the provided id
     * @throws when the id is malformed, when at least one of the retrieved documents can't be parsed by the validator, when there's a mongo execution error
     */
    public async get(id = ""): Promise<TApiResult<TReturn> | null> {
        try {
            const uuid = randomUUID();
            this.pf.trace({ uuid, id }, "Get began");
            let result: TApiResult<TReturn>;
            if (id) {
                result = await this.getSingleDocument(id);
            } else {
                result = await this.getAllDocuments();
            }
            this.pf.trace({ uuid }, "Get finished");
            return result;
        } catch (error) {
            throw new Error(`Error while executing a get query: ${getErrorMessage(error)} - ${id.toString()}`);
        }
    }
    /**
     * Creates a new document in the database based on the provided object. Adds default values before inserting it in the database. Handles autoincrement fields. Parses the inserted document
     * @param documentToAdd - the document to add
     * @returns the added document
     * @throws when the factory can't create a document based on the provided object, when the added document can't be parsed by the validator, when there's a mongo execution error, when there's a problem with the autoincrement fields
     */
    public async add(documentToAdd: TReturn): Promise<TReturn> {
        try {
            const uuid = randomUUID();
            this.pf.trace({ uuid }, "Add began");
            let documentFromFactory;
            try {
                documentFromFactory = this.getDocumentFromFactory(documentToAdd);
            } catch (error) {
                throw new Error(`Error while parsing the incoming object: ${getErrorMessage(error)} - ${JSON.stringify(documentToAdd)}`);
            }

            documentFromFactory = await this.handleAutoincrement(documentFromFactory);

            const connection = await this.mongo.getConnection();
            const insertResult = await connection.collection(this.collection).insertOne(documentFromFactory);
            try {
                const result: TReturn = this.validator.parse({ ...documentFromFactory, _id: insertResult.insertedId });
                this.pf.trace({ uuid }, "Add finished");
                return result;
            } catch (error) {
                throw new Error(`Error while conforming a query result to the provided type: ${getErrorMessage(error)} - ${JSON.stringify(documentToAdd)}`);
            }
        } catch (error) {
            throw new Error(`Error while executing an add query: ${getErrorMessage(error)} - ${JSON.stringify(documentToAdd)}`);
        }
    }
    /**
     * Updates a single document in the database
     * @param id - the id of the document that should be updated
     * @param documentToUpdate - an object with fields that should be updated
     * @returns the updated document
     * @throws when the id is malformed, when the factory can't create a document based on the provided object, when the updated document can't be parsed by the validator, when there's a mongo execution error, when no documents were updated
     */
    public async update(id: string, documentToUpdate: TReturn): Promise<TReturn> {
        try {
            const uuid = randomUUID();
            this.pf.trace({ uuid, id }, "Update began");
            const connection = await this.mongo.getConnection();
            const mongoId = new ObjectId(id);
            const documentFromFactory = this.getDocumentFromFactory(
                this.removeCoreFields(documentToUpdate), 
                true
            );
            try {
                this.validator.parse(documentFromFactory);
            } catch (error) {
                throw new Error(`Error while parsing the incoming object: ${getErrorMessage(error)} - ${JSON.stringify(documentToUpdate)}`);
            }
            
            const dDocumentToUpdate = this.updateDocumentObjWithDefaultsDot(documentFromFactory, documentToUpdate);

            const { value } = await connection.collection(this.collection).findOneAndUpdate({ _id: mongoId }, { $set: dotObj.object(dDocumentToUpdate) }, { upsert: false, returnDocument: "after" });
            if (value === null) {
                throw new Error(`Error while updating an object: the provided id doesn't exist ${id}`);
            }
            
            let updatedResult: TReturn;
            try {
                updatedResult = this.validator.parse(value);
            } catch (error) {
                throw new Error(`Error while conforming a query result to the provided type: ${getErrorMessage(error)} - ${JSON.stringify(value)}`);
            }

            try {
                await this.applyUpdateSpec(updatedResult, uuid);
            } catch (error) {
                throw new Error(`Failed to apply the update map: ${getErrorMessage(error)}`);
            }

            this.pf.trace({ uuid }, "Update finished");
            return updatedResult;
        } catch (error) {
            throw new Error(`Error while executing an update query: ${getErrorMessage(error)} - ${JSON.stringify(documentToUpdate)}`);
        }
    }
    /**
     * Deletes a single document from the database
     * @param id - the id of the document that should be deleted
     * @returns null
     * @throws when the id is malformed, when there's a mongo execution error, when the number of deleted documents is different than 1 (0 or > 1)
     */
    public async delete(id: string): Promise<null> {
        try {
            const uuid = randomUUID();
            this.pf.trace({ uuid, id }, "Delete began");
            const connection = await this.mongo.getConnection();
            const mongoId = new ObjectId(id);
            const deletedDocument = await connection.collection(this.collection).deleteOne({ _id: mongoId });
            if (deletedDocument?.deletedCount === 0) {
                throw new Error(`Couldn't delete a document because it didn't exist: ${id}`);
            } else if (deletedDocument?.deletedCount > 1) {
                throw new Error(`Somehow deleted more than 1 document: ${id}`);
            }
            this.pf.trace({ uuid }, "Delete finished");
            return null;
        } catch (error) {
            throw new Error(`Error while executing a delete query: ${getErrorMessage(error)} - ${id}`);
        }
    }

    /**
     * Analyzes the update map and performs an update of each specified document based on the result of the update function
     * @param updatedResult - the updated document
     * @param uuid - the performance logger uuid
     */
    private async applyUpdateSpec(updatedResult: TReturn, uuid: string = randomUUID()): Promise<void> {
        this.pf.trace({ uuid }, "applyUpdateSpec began");
        const connection = await this.mongo.getConnection();
        for (const updateSpec of this.updateSpecs) {
            this.pf.trace({ uuid, updateSpec }, "applyUpdateSpec processing");
            const documentsToUpdate = await connection.collection(updateSpec.toCollection)
                .find({ [`${updateSpec.toField}.${updateSpec.idField}`]: String(dotObj.pick(updateSpec.idField, updatedResult)) })
                .project({ [updateSpec.toField]: 1, _id: 1 })
                .toArray();
            this.pf.trace({ uuid }, `applyUpdateSpec processing found ${documentsToUpdate.length} documents to update`);
            for (const documentToUpdate of documentsToUpdate) {
                if (updateSpec.type === "array") {
                    await this.handleUpdateSpecArrayType(updatedResult, documentToUpdate, updateSpec);
                } else if (updateSpec.type === "object") {
                    await this.handleUpdateSpecObjectType(updatedResult, documentToUpdate, updateSpec);
                }
            }
        }
        this.pf.trace({ uuid }, "applyUpdateSpec finished");
    }
    /**
     * Handles the object update map case - replaces the existing object in the associated document's "toField" with updatedResult and updates it in the db
     * @param updatedResult - the updated document
     * @param documentToUpdate - the associated document that should be updated
     * @param updateSpec - the map entry which should be used
     */
    private async handleUpdateSpecObjectType(updatedResult: TReturn, documentToUpdate: Document, updateSpec: TUpdateSpec): Promise<void> {
        const connection = await this.mongo.getConnection();
        const documentDestinationObject = dotObj.pick(updateSpec.toField, documentToUpdate) as TReturn;
        if (typeof documentDestinationObject === "object") {
            await connection.collection(updateSpec.toCollection).findOneAndUpdate(
                { _id: new ObjectId(documentToUpdate._id as string) }, 
                { $set: { [updateSpec.toField]: updatedResult } }, 
                { upsert: false }
            );
        }
    }
    /**
     * Handles the array update map case - finds the corresponding object in the associated document's "toField" array, replaces it with updatedResult and updates the document with the new array
     * @param updatedResult - the updated document
     * @param documentToUpdate - the associated document that should be updated
     * @param updateSpec - the map entry which should be used
     */
    private async handleUpdateSpecArrayType(updatedResult: TReturn, documentToUpdate: Document, updateSpec: TUpdateSpec): Promise<void> {
        const connection = await this.mongo.getConnection();
        const documentDestinationArray = dotObj.pick(updateSpec.toField, documentToUpdate) as TReturn[];
        if (Array.isArray(documentDestinationArray)) {
            let didModify = false;
            const updatedArray = documentDestinationArray.map((destEntry) => {
                if (dotObj.pick(updateSpec.idField, destEntry) === dotObj.pick(updateSpec.idField, updatedResult)) {
                    didModify = true;
                    return updatedResult;
                } else {
                    return destEntry;
                }
            });
            if (didModify) {
                await connection.collection(updateSpec.toCollection).findOneAndUpdate(
                    { _id: new ObjectId(documentToUpdate._id as string) }, 
                    { $set: { [updateSpec.toField]: updatedArray } }, 
                    { upsert: false }
                );
            }
        }
    }
    /**
     * Proxy function to call the factory with appropriate parameters
     * @param input The input object
     * @param includeRequired The required defaults factory parameter
     * @returns An object generated by the factory
     */
    private getDocumentFromFactory(input: TReturn, includeRequired = false): TReturn {
        return isGenericFactory<TReturn>(this.factory) ? this.factory(input, this.validator, this.requiredDefaults, includeRequired) : this.factory(input, includeRequired);
    }
    /**
     * Returns every document stored in the collection, parses each of them
     * @returns an array of documents
     * @throws when there's a mongo execution error, when at least one of the retrieved documents can't be parsed by the validator
     */
    private async getAllDocuments(): Promise<TApiResult<TReturn>> {
        try {
            const connection = await this.mongo.getConnection();
            const documents = await connection.collection(this.collection).find().toArray();
            if (!documents) {
                return null;
            }
            try {
                const result: TReturn[] = documents.map((document) => {
                    return this.validator.parse(document);
                });
                return result;
            } catch (error) {
                throw new Error(`Error while conforming a query result to the provided type: ${getErrorMessage(error)}`);
            }
        } catch (error) {
            throw new Error(`Error while executing a get all documents query: ${getErrorMessage(error)}`);
        }
    }
    /**
     * Returns a single document from the database with the provided id or null if it can't be found. Parses the returned document.
     * @param id - the id of the document that should be returned
     * @returns a single document or null
     * @throws when the id is malformed, when there's a mongo execution error, when at least one of the retrieved documents can't be parsed by the validator
     */
    private async getSingleDocument(id: string): Promise<TApiResult<TReturn> | null> {
        try {
            const connection = await this.mongo.getConnection();
            const mongoId = new ObjectId(id);
            const document = await connection.collection(this.collection).findOne(mongoId);
            if (!document) {
                return null;
            }
            try {
                const result: TReturn = this.validator.parse(document);
                return result;
            } catch (error) {
                throw new Error(`Error while conforming a query result to the provided type: ${getErrorMessage(error)}`);
            }
        } catch (error) {
            throw new Error(`Error while executing a get single document query: ${getErrorMessage(error)} - ${id.toString()}`);
        }
    }
    /**
     * Adds search options to the cursor and returns it
     * @param cursor - the cursor retrieved from a collection search query
     * @param sort - the sort object compliant with the Sort type - [key as string]: number
     * @param page - if greater than zero, you should also specify the pageSize parameter. Skips the provided number of results
     * @param pageSize - determines how big each page should be
     * @param limit - limits the number of results to the provided value. Shouldn't be used with paging
     * @returns the cursor
     * @throws when there's a problem with applying the search options
     */
    private applyCursorOptions(cursor: FindCursor<WithId<Document>>, sort: Sort, page: number, pageSize: number, limit: number ): FindCursor<WithId<Document>> {
        try {
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
            return cursor;
        } catch (error) {
            throw new Error(`Error while applying cursor options: ${getErrorMessage(error)}`);
        }
    }
    /**
     * If the internal autoincrement array has fields that exist in the provided document, it will find the next biggest value of that field in the database, increment it by one and modify the provided document, then return it
     * @param documentFromFactory - a document generated by the factory (with default fields)
     * @returns documentFromFactory
     * @throws when the provided document doesn't have fields defined in the internal autoincrement array, when there's a mongo execution error
     */
    private async handleAutoincrement(documentFromFactory: TReturn): Promise<TReturn> {
        try {
            const connection = await this.mongo.getConnection();
            if (this.autoIncrementField) {
                const autoIncrementKey = this.autoIncrementField as keyof TReturn;
                if (typeof documentFromFactory[autoIncrementKey] !== "number") {
                    throw new Error(`The factory didn't produce an object with a proper autoincrement field: ${this.autoIncrementField}: ${JSON.stringify(documentFromFactory)}`);
                }

                const latestIndex: TLooseObject[] = await connection.collection(this.collection).find().project({ [this.autoIncrementField]: 1 }).sort({ [this.autoIncrementField]: -1 }).limit(1).toArray();
                if (latestIndex && latestIndex.length && typeof latestIndex[0][this.autoIncrementField] === "number") {
                    (documentFromFactory[autoIncrementKey] as unknown) = (latestIndex[0][this.autoIncrementField] as number) + 1;
                } else {
                    (documentFromFactory[autoIncrementKey] as unknown) = 0;
                }
            }
            return documentFromFactory;
        } catch (error) {
            throw new Error(`Error while handling autoincrement: ${getErrorMessage(error)} - ${JSON.stringify(documentFromFactory)}`);
        }
    }
    /**
     * Removes forbidden update / add fields from the provided document, like "_id"
     * @param document - the document to modify
     * @returns the provided document with removed forbidden fields
     */
    private removeCoreFields(document: TReturn): TReturn {
        delete document._id;
        return document;
    }
    /**
     * Adds fields with default values to the provided document based on the object generated by the factory, returns a dotted version of that document
     * @param documentFromFactory - a document generated by the factory (with default fields)
     * @param documentToUpdate - the document that should be updated with the default fields
     * @returns a dotted document object
     */
    private updateDocumentObjWithDefaultsDot(documentFromFactory: TReturn, documentToUpdate: TLooseObject): TLooseObject {
        const dDocumentFromTFactory = dotObj.dot(documentFromFactory) as TLooseObject;
        const dDocumentToUpdate = dotObj.dot(documentToUpdate) as TLooseObject;
        for (const key of Object.keys(dDocumentToUpdate)) {
            dDocumentToUpdate[key] = dDocumentFromTFactory[key] as TLooseObject;
        }
        return dDocumentToUpdate;
    }
}