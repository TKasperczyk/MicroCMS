"use strict";

import { MongoClient, Db, ObjectId } from "mongodb";

export class Mongo {
    constructor(database: string) {
        this.database = database;
        this.client = new MongoClient("mongodb://127.0.0.1:27017");
    };

    private client: MongoClient;
    private connection: Db | undefined;
    private database: string;

    public lastError: any;

    public async init(): Promise<boolean> {
        try {
            await this.client.connect();
            this.connection = this.client.db(this.database);
            this.client.on("error", (error: any) => {
                this.lastError = error;
            });
            return true;
        } catch (error) {
            const errorMessage = `Error while initializing the Mongo connection: ${error}`;
            this.lastError = errorMessage;
            throw new Error(errorMessage)
        }
    };
    public async getConnection(): Promise<Db>{
        if (!this.connection){
            try {
                await this.init();
            } catch (error) {
                const errorMessage = `Error while initializing the Mongo connection to get the client: ${error}}`;
                this.lastError = errorMessage;
                throw new Error(errorMessage);
            }
        }
        if (!this.connection){
            throw new Error(`Failed to initialize the Mongo connection for client`);
        }
        return this.connection;
    }
};

export { ObjectId };