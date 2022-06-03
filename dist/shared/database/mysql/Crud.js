"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crud = void 0;
const Mysql_1 = require("./Mysql");
class Crud {
    constructor(database, table, validator) {
        this.mysql = new Mysql_1.Mysql(database);
        this.table = table;
        this.validator = validator;
    }
    ;
    mysql;
    table;
    validator;
    async get(id) {
        const query = `SELECT * FROM ${this.table} WHERE id = ?;`;
        try {
            const [rows] = await this.mysql.query(query, [id]);
            if (!rows || !rows.length) {
                return null;
            }
            let result;
            try {
                result = this.validator.parse(rows[0]);
            }
            catch (error) {
                const errorMessage = `Error while conforming a query result to the provided type: ${error}`;
                throw new Error(errorMessage);
            }
            return result;
        }
        catch (error) {
            const errorMessage = `Error while executing a GET query: ${error} - ${query}`;
            throw new Error(errorMessage);
        }
    }
    ;
}
exports.Crud = Crud;
;
//# sourceMappingURL=Crud.js.map