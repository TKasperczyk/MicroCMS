import * as dotObj from "dot-object";
import { ObjectId } from "mongodb";

import { isObject } from "@framework/helpers/assertions";
import { optionalDeepParse } from "@framework/helpers/optionalDeepParse";

import { TCrudOperations } from "@framework/types/database";
import { TLooseObject } from "@framework/types/generic";

(dotObj.keepArray as boolean) = true; //eslint-disable-line

export abstract class IncomingParser {
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

    protected crudRouteArgs: TCrudOperations;
    protected crudRequiredArgsEnabled: boolean;
    protected lastError: string;

    private parseObjectId(obj: TLooseObject): TLooseObject {
        const toFilter = dotObj.dot(obj) as TLooseObject;
        const keys = Object.keys(toFilter).filter(
            keyToFilter => 
                ["id", "_id"].includes(keyToFilter) || 
                ["._id", ".id"].some(id => keyToFilter.includes(id))
        );
        for (const key of keys) {
            if (typeof toFilter[key] === "string") {
                try {
                    toFilter[key] = new ObjectId(toFilter[key] as string);
                } catch (error) {
                    const errorMessage = `Error while parsing the _id parameter in the incoming object: ${String(error)} - ${toFilter[key] as string}`;
                    this.lastError = errorMessage;
                    throw new Error(errorMessage);
                }
            }
        }
        return dotObj.object(toFilter);
    }

    public parseQuery(query: TLooseObject | string): TLooseObject {
        let parsedQuery = optionalDeepParse(query);
        parsedQuery = this.parseObjectId(parsedQuery);
        return parsedQuery;
    }
    public parseBody(body: TLooseObject | string): TLooseObject {
        return optionalDeepParse(body);
    }
    public parseParams(params: TLooseObject | string): TLooseObject {
        let parsedParams = optionalDeepParse(params);
        parsedParams = this.parseObjectId(parsedParams);
        return parsedParams;
    }
    public checkRequiredArgs(obj: TLooseObject, requiredArgList: string[]): boolean {
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
    public checkCrudRequiredArgs(obj: TLooseObject, crudMethodName: keyof TCrudOperations): boolean {
        //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
        return this.crudRouteArgs[crudMethodName].every((crudRouteArg: TLooseObject) => {
            const result = this.checkRequiredArgs(obj[crudRouteArg.reqPartName as string] as TLooseObject, crudRouteArg.requiredArgList as string[]);
            if (!result) {
                this.lastError = `missing one of the required args for ${String(crudRouteArg.reqPartName)} (${JSON.stringify(crudRouteArg.requiredArgList)}): ${JSON.stringify(obj)}`;
            }
            return result;
        });
    }
    public checkUserPresence(obj: TLooseObject): boolean {
        const userPresent = isObject(obj?.user);
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