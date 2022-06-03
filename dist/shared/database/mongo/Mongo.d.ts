import { Db, ObjectId } from "mongodb";
export declare class Mongo {
    constructor(database: string);
    private client;
    private connection;
    private database;
    lastError: any;
    init(): Promise<boolean>;
    getConnection(): Promise<Db>;
}
export { ObjectId };
