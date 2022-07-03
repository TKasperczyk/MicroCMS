import { createConnection, Connection } from "mysql2/promise";

import { TLooseObject } from "@framework/types/generic";

export class Mysql {
    constructor(database: string) {
        this.database = database;
        this.lastError = "";
    }

    private connection: Connection | undefined;
    private database: string;

    public lastError: string;

    public async init(): Promise<boolean> {
        try {
            this.connection = await createConnection({
                host: "localhost",
                user: "root",
                password: "Norske",
                database: this.database,
                connectTimeout: 500
            });
            this.connection.on("error", (error) => {
                this.lastError = String(error);
            });
            return true;
        } catch (error) {
            const errorMessage = `Error while initializing the SQL connection: ${String(error)}`;
            this.lastError = errorMessage;
            throw new Error(errorMessage);
        }
    }
    public async query(query: string, params: string[]): Promise<TLooseObject | TLooseObject[]> {
        if (!this.connection) {
            try {
                await this.init();
            } catch (error) {
                const errorMessage = `Error while initializing the SQL connection to execute the query: ${String(error)} - ${query}`;
                this.lastError = errorMessage;
                throw new Error(errorMessage);
            }
        }
        if (!this.connection) {
            throw new Error(`Failed to initialize the SQL connection for the query: ${query}`);
        }
        try {
            return await this.connection.execute(query, params);
        } catch (error) {
            const errorMessage = `Error while executing the query: ${String(error)} - ${query}`;
            this.lastError = errorMessage;
            throw new Error(errorMessage);
        }
    }
}