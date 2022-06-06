"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crud = void 0;
const Mongo_1 = require("./Mongo");
class Crud {
    constructor(database, collection, validator) {
        this.mongo = new Mongo_1.Mongo(database);
        this.collection = collection;
        this.validator = validator;
    }
    ;
    mongo;
    collection;
    validator;
    async get(id) {
        try {
            const connection = await this.mongo.getConnection();
            const mongoId = new Mongo_1.ObjectId(id);
            const document = await connection.collection(this.collection).findOne(mongoId);
            if (!document) {
                return null;
            }
            try {
                const result = this.validator.parse(document);
                return result;
            }
            catch (error) {
                const errorMessage = `Error while conforming a query result to the provided type: ${error}`;
                throw new Error(errorMessage);
            }
        }
        catch (error) {
            const errorMessage = `Error while executing a get query: ${error} - ${id.toString()}`;
            throw new Error(errorMessage);
        }
    }
    ;
    async search({ query, sort = {}, page = 0, pageSize = 10, limit = 0 }) {
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
                if (!shouldSort) {
                    cursor = cursor.sort({ _id: -1 });
                }
                const skip = page - 1 * pageSize;
                cursor = cursor.skip(skip).limit(pageSize);
            }
            else if (limit > 0) {
                cursor = cursor.limit(limit);
            }
            try {
                const result = [];
                await cursor.forEach((document) => {
                    const parsedDocument = this.validator.parse(document);
                    result.push(parsedDocument);
                });
                return result;
            }
            catch (error) {
                const errorMessage = `Error while conforming a query result to the provided type: ${error} - ${JSON.stringify(query)}`;
                throw new Error(errorMessage);
            }
        }
        catch (error) {
            const errorMessage = `Error while executing a search query: ${error} - ${JSON.stringify(query)}`;
            throw new Error(errorMessage);
        }
    }
    ;
    async aggregate(pipeline) {
        try {
            const connection = await this.mongo.getConnection();
            const cursor = connection.collection(this.collection).aggregate(pipeline);
            try {
                const result = [];
                await cursor.forEach((document) => {
                    const parsedDocument = this.validator.parse(document);
                    result.push(parsedDocument);
                });
                return result;
            }
            catch (error) {
                const errorMessage = `Error while conforming a query result to the provided type: ${error} - ${JSON.stringify(pipeline)}`;
                throw new Error(errorMessage);
            }
        }
        catch (error) {
            const errorMessage = `Error while executing an aggregate query: ${error} - ${JSON.stringify(pipeline)}`;
            throw new Error(errorMessage);
        }
    }
    ;
    async add(documentToAdd) {
        try {
            const connection = await this.mongo.getConnection();
            const _id = await connection.collection(this.collection).insertOne(documentToAdd);
            try {
                const result = this.validator.parse({ ...documentToAdd, _id });
                return result;
            }
            catch (error) {
                const errorMessage = `Error while conforming a query result to the provided type: ${error} - ${JSON.stringify(documentToAdd)}`;
                throw new Error(errorMessage);
            }
        }
        catch (error) {
            const errorMessage = `Error while executing an add query: ${error} - ${JSON.stringify(documentToAdd)}`;
            throw new Error(errorMessage);
        }
    }
    ;
    async update(id, documentToUpdate) {
        try {
            const connection = await this.mongo.getConnection();
            const mongoId = new Mongo_1.ObjectId(id);
            const updatedDocument = await connection.collection(this.collection).findOneAndUpdate({ _id: mongoId }, { $set: documentToUpdate }, { returnDocument: "after" });
            try {
                const result = this.validator.parse(updatedDocument);
                return result;
            }
            catch (error) {
                const errorMessage = `Error while conforming a query result to the provided type: ${error} - ${JSON.stringify(updatedDocument)}`;
                throw new Error(errorMessage);
            }
        }
        catch (error) {
            const errorMessage = `Error while executing an add query: ${error} - ${JSON.stringify(documentToUpdate)}`;
            throw new Error(errorMessage);
        }
    }
    ;
    async delete(id) {
        try {
            const connection = await this.mongo.getConnection();
            const mongoId = new Mongo_1.ObjectId(id);
            const deletedDocument = await connection.collection(this.collection).deleteOne({ _id: mongoId });
            return deletedDocument?.deletedCount === 1;
        }
        catch (error) {
            const errorMessage = `Error while executing an add query: ${error} - ${JSON.stringify(id)}`;
            throw new Error(errorMessage);
        }
    }
    ;
}
exports.Crud = Crud;
;
//# sourceMappingURL=Crud.js.map