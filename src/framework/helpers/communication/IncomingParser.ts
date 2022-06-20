"use strict";


import { ObjectId } from "mongodb";

import { optionalParse } from "@framework/helpers/optionalParse";
import { CrudOperations } from "@framework/types/database";
import { LooseObject } from "@framework/types/generic";

export class IncomingParser {
    constructor(typeName: string, crudRequiredArgsEnabled = false) {
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
    }

    protected crudRouteArgs: CrudOperations;
    protected crudRequiredArgsEnabled: boolean;
    protected lastError: string;

    private parseObjectId(obj: LooseObject): LooseObject {
        for (const key of Object.keys(obj).filter(keyToFilter => ["id", "_id"].includes(keyToFilter))) {
            if (typeof obj[key] === "string") {
                try {
                    obj[key] = new ObjectId(obj[key] as string);
                } catch (error) {
                    const errorMessage = `Error while parsing the _id parameter in the incoming object: ${String(error)} - ${obj[key] as string}`;
                    this.lastError = `Malformed id at key ${key}: ${obj[key] as string}`;
                    throw new Error(errorMessage);
                }
            }
        }
        return obj;
    }

    public parseQuery(query: LooseObject | string): LooseObject {
        let parsedQuery = optionalParse(query);
        parsedQuery = this.parseObjectId(parsedQuery);
        return parsedQuery;
    }
    public parseBody(body: LooseObject | string): LooseObject {
        return optionalParse(body);
    }
    public parseParams(params: LooseObject | string): LooseObject {
        let parsedParams = optionalParse(params);
        parsedParams = this.parseObjectId(parsedParams);
        return parsedParams;
    }
    public checkRequiredArgs(obj: LooseObject, requiredArgList: string[]): boolean {
        const currentArgs = Object.keys(obj);
        return requiredArgList.every((requiredArgName) => {
            const argPresent = currentArgs.includes(requiredArgName);
            if (argPresent && requiredArgName === "id") {
                try {
                    new ObjectId(obj.id as string);
                    return true;
                } catch (error) {
                    this.lastError = `id present in the args list but its malformed: ${obj?.id as string}`;
                    return false;
                }
            } else {
                return argPresent;
            }
        });
    }
    public checkCrudRequiredArgs(obj: LooseObject, crudMethodName: keyof CrudOperations): boolean {
        //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
        return this.crudRouteArgs[crudMethodName].every((crudRouteArg: LooseObject) => {
            const result = this.checkRequiredArgs(obj[crudRouteArg.reqPartName as string] as LooseObject, crudRouteArg.requiredArgList as string[]);
            if (!result) {
                this.lastError = `missing one of the required args for ${String(crudRouteArg.reqPartName)} (${JSON.stringify(crudRouteArg.requiredArgList)}): ${JSON.stringify(obj)}`;
            }
            return result;
        });
        return true;
    }
    public checkUserPresence(obj: LooseObject): boolean {
        const userPresent = typeof obj?.user === "object";
        const loginPresent = typeof obj?.user?.login === "string"; //eslint-disable-line @typescript-eslint/no-unsafe-member-access
        const groupPresent = typeof obj?.user?.group === "string"; //eslint-disable-line @typescript-eslint/no-unsafe-member-access
        if (!userPresent) {
            this.lastError = `missing user object in ${JSON.stringify(obj)}`;
        }
        if (!loginPresent) {
            this.lastError = `missing login in the user object in ${JSON.stringify(obj)}`;
        }
        if (!groupPresent) {
            this.lastError = `missing group in the user object in ${JSON.stringify(obj)}`;
        }
        return userPresent && loginPresent && groupPresent;
    }
}