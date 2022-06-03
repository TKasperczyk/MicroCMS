"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mysql = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
class Mysql {
    constructor(database) {
        this.database = database;
    }
    ;
    connection;
    database;
    lastError;
    async init() {
        try {
            this.connection = await promise_1.default.createConnection({
                host: "localhost",
                user: "root",
                password: "Norske",
                database: this.database,
                connectTimeout: 500
            });
            this.connection.on("error", (error) => {
                this.lastError = error;
            });
            return true;
        }
        catch (error) {
            const errorMessage = `Error while initializing the SQL connection: ${error}`;
            this.lastError = errorMessage;
            throw new Error(errorMessage);
        }
    }
    ;
    async query(query, params) {
        if (!this.connection) {
            try {
                await this.init();
            }
            catch (error) {
                const errorMessage = `Error while initializing the SQL connection to execute the query: ${error} - ${query}`;
                this.lastError = errorMessage;
                throw new Error(errorMessage);
            }
        }
        if (!this.connection) {
            throw new Error(`Failed to initialize the SQL connection for the query: ${query}`);
        }
        try {
            return await this.connection.execute(query, params);
        }
        catch (error) {
            const errorMessage = `Error while executing the query: ${error} - ${query}`;
            this.lastError = errorMessage;
            throw new Error(errorMessage);
        }
    }
    ;
}
exports.Mysql = Mysql;
;
//# sourceMappingURL=Mysql.js.map