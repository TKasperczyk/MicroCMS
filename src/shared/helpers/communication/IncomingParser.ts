"use strict";

import { LooseObject } from "../../types";
import { CrudRoutes } from "../../types";
import { optionalParse } from "../optionalParse";
import { ObjectId } from "mongodb";

export class IncomingParser {
    constructor(typeName: string, crudRequiredArgsEnabled: boolean = false) {
        this.crudRouteArgs = {
            search: [{ reqPartName: "parsedQuery", requiredArgList: ["query"] }],
            aggregate: [{ reqPartName: "parsedQuery", requiredArgList: ["pipeline"] }],
            get: [{ reqPartName: "parsedParams", requiredArgList: [] }],
            add: [{ reqPartName: "parsedBody", requiredArgList: [typeName] }],
            update: [{ reqPartName: "parsedParams", requiredArgList: ["id"] }, { reqPartName: "parsedBody", requiredArgList: [typeName] }],
            delete: [{ reqPartName: "parsedParams", requiredArgList: ["id"] }],
        };
        this.crudRequiredArgsEnabled = crudRequiredArgsEnabled;
        this.lastError = "";
    };

    protected crudRouteArgs: CrudRoutes;
    protected crudRequiredArgsEnabled: boolean;
    protected lastError: string;

    private parseObjectId(obj: LooseObject): LooseObject {
        for (const key of Object.keys(obj).filter(keyToFilter => ["id", "_id"].includes(keyToFilter))){
            if (typeof obj[key] === "string") {
                try {
                    obj[key] = new ObjectId(obj[key]);
                } catch (error) {
                    const errorMessage = `Error while parsing the _id parameter in the incoming object: ${error} - ${obj[key]}`;
                    this.lastError = `Malformed id at key ${key}: ${obj[key]}`;
                    throw new Error(errorMessage);
                }
            }
        }
        return obj;
    };

    public parseQuery(query: LooseObject | string): LooseObject {
        let parsedQuery = optionalParse(query);
        parsedQuery = this.parseObjectId(parsedQuery);
        return parsedQuery;
    };
    public parseBody(body: LooseObject | string): LooseObject {
        return optionalParse(body);
    };
    public parseParams(params: LooseObject | string): LooseObject {
        let parsedParams = optionalParse(params);
        parsedParams = this.parseObjectId(parsedParams);
        return parsedParams;
    };
    public checkRequiredArgs(obj: LooseObject, requiredArgList: string[]): boolean {
        const currentArgs = Object.keys(obj);
        return requiredArgList.every((requiredArgName) => {
            const argPresent = currentArgs.includes(requiredArgName);
            if(argPresent && requiredArgName === "id") {
                try {
                    new ObjectId(obj!.id);
                    return true;
                } catch (error) {
                    this.lastError = `id present in the args list but its malformed: ${obj?.id}`;
                    return false;
                }
            } else {
                return argPresent;
            }
        });
    }
    public checkCrudRequiredArgs(obj: LooseObject, crudMethodName: string): boolean {
        return this.crudRouteArgs[crudMethodName as keyof CrudRoutes].every((crudRouteArg: LooseObject) => {
            const result = this.checkRequiredArgs(obj[crudRouteArg.reqPartName], crudRouteArg.requiredArgList);
            if (!result){
                this.lastError = `missing one of the required args for ${crudRouteArg.reqPartName} (${JSON.stringify(crudRouteArg.requiredArgList)}): ${JSON.stringify(obj)}`;
            }
            return result;
        });
    };
};