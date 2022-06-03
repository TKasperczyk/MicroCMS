export declare class Mysql {
    constructor(database: string);
    private connection;
    private database;
    lastError: any;
    init(): Promise<boolean>;
    query(query: string, params: any[]): Promise<any>;
}
