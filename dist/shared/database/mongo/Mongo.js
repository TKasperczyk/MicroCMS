"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectId = exports.Mongo = void 0;
const mongodb_1 = require("mongodb");
Object.defineProperty(exports, "ObjectId", { enumerable: true, get: function () { return mongodb_1.ObjectId; } });
class Mongo {
    constructor(database) {
        this.database = database;
        this.client = new mongodb_1.MongoClient("mongodb://127.0.0.1:27017");
    }
    ;
    client;
    connection;
    database;
    lastError;
    async init() {
        try {
            await this.client.connect();
            this.connection = this.client.db(this.database);
            this.client.on("error", (error) => {
                this.lastError = error;
            });
            return true;
        }
        catch (error) {
            const errorMessage = `Error while initializing the Mongo connection: ${error}`;
            this.lastError = errorMessage;
            throw new Error(errorMessage);
        }
    }
    ;
    async getConnection() {
        if (!this.connection) {
            try {
                await this.init();
            }
            catch (error) {
                const errorMessage = `Error while initializing the Mongo connection to get the client: ${error}}`;
                this.lastError = errorMessage;
                throw new Error(errorMessage);
            }
        }
        if (!this.connection) {
            throw new Error(`Failed to initialize the Mongo connection for client`);
        }
        return this.connection;
    }
}
exports.Mongo = Mongo;
;
//# sourceMappingURL=Mongo.js.map