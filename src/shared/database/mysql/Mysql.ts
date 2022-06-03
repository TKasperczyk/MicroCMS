"use strict";

import mysql from "mysql2/promise";

export class Mysql {
    constructor(database: string) {
        this.database = database;
    };

    private connection: mysql.Connection | undefined;
    private database: string;

    public lastError: any;

    public async init(): Promise<boolean> {
        try {
            this.connection = await mysql.createConnection({
                host: "localhost",
                user: "root",
                password: "Norske",
                database: this.database,
                connectTimeout: 500
            });
            this.connection.on("error", (error: any) => {
                this.lastError = error;
            });
            return true;
        } catch (error) {
            const errorMessage = `Error while initializing the SQL connection: ${error}`;
            this.lastError = errorMessage;
            throw new Error(errorMessage)
        }
    };
    public async query(query: string, params: any[]): Promise<any> {
        if (!this.connection){
            try {
                await this.init();
            } catch (error) {
                const errorMessage = `Error while initializing the SQL connection to execute the query: ${error} - ${query}`;
                this.lastError = errorMessage;
                throw new Error(errorMessage);
            }
        }
        if (!this.connection){
            throw new Error(`Failed to initialize the SQL connection for the query: ${query}`);
        }
        try {
            return await this.connection.execute(query, params);
        } catch (error) {
            const errorMessage = `Error while executing the query: ${error} - ${query}`;
            this.lastError = errorMessage;
            throw new Error(errorMessage);
        }
    };
};