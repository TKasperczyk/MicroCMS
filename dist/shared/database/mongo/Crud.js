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
            let result;
            try {
                result = this.validator.parse(document);
            }
            catch (error) {
                const errorMessage = `Error while conforming a query result to the provided type: ${error}`;
                throw new Error(errorMessage);
            }
            return result;
        }
        catch (error) {
            const errorMessage = `Error while executing a GET query: ${error} - ${id.toString()}`;
            throw new Error(errorMessage);
        }
    }
    ;
}
exports.Crud = Crud;
;
//# sourceMappingURL=Crud.js.map