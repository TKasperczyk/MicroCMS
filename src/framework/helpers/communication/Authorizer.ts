import * as dotObj from "dot-object";
import { Event } from "socket.io";

import { extractPacketData } from "@framework/helpers/communication/socket/packetData";

import { ApiResult } from "@framework/types/communication/ApiResult";
import { AuthorizeMap } from "@framework/types/communication/AuthorizeMap";
import { SocketNextFunction } from "@framework/types/communication/socket/SocketNextFunction";
import { SocketError } from "@framework/types/errors";
import { LooseObject } from "@framework/types/generic";

/*
    TODO: the aggregation operation will allow users to rename fields in the output object and thus bypass the output authorizer
*/

//Test

(dotObj.keepArray as boolean) = true; //eslint-disable-line

export class Authorizer<InputType> {
    constructor(authorizeMap: AuthorizeMap, typeName: string) {
        this.authorizeMap = authorizeMap;
        this.typeName = typeName;
    }

    private authorizeMap: AuthorizeMap;
    private typeName: string;

    /* eslint-disable @typescript-eslint/no-unused-vars */
    public customInputLogic(input: InputType): boolean { return true; }
    public customOutputLogic(response: ApiResult<InputType>, user: LooseObject): ApiResult<InputType> | null { return null; }
    public customOperationLogic(operation: string): boolean { return true; }
    /* eslint-enable @typescript-eslint/no-unused-vars */

    public authorizeOutput(response: ApiResult<InputType>, user: LooseObject): ApiResult<InputType> {
        if (!user?.login || !user?.group) {
            throw new Error("Malformed or missing user object");
        }
        if (!Array.isArray(response) && typeof response !== "object") {
            return response;
        }

        let result: ApiResult<InputType> = response;
        result = this.hideFields(result, this.authorizeMap.group[user.group as string]?.hiddenReadFields || []);
        result = this.hideFields(result, this.authorizeMap.user[user.login as string]?.hiddenReadFields || []);
        
        const customOutputLogicResult = this.customOutputLogic(result, user);
        if (customOutputLogicResult !== null) {
            result = customOutputLogicResult;
        }

        return result;
    }
    public middleware(packet: Event, next: SocketNextFunction): void {
        const { msg, eventName } = extractPacketData(packet);
        if (!msg?.user?.login || !msg?.user?.group) {
            return next(new SocketError("Malformed or missing user object in the incoming message", msg.id));
        }

        if (
            !this.authorizeOperation(eventName, this.authorizeMap.group[msg.user.group as string]?.forbiddenOperations || []) ||
            !this.authorizeOperation(eventName, this.authorizeMap.user[msg.user.login as string]?.forbiddenOperations || [])
        ) {
            return next(new SocketError(`A user tried to perform a forbidden operation ${msg.user.login as string}: ${eventName}`, msg.id));
        }

        const inputObj = msg?.parsedBody[this.typeName] as InputType;
        if (typeof inputObj === "object") {
            if (
                !this.checkInputObj(inputObj, this.authorizeMap.group[msg.user.group as string]?.forbiddenWriteFields || []) ||
                !this.checkInputObj(inputObj, this.authorizeMap.user[msg.user.login as string]?.forbiddenWriteFields || [])
            ) {
                return next(new SocketError(`A user tried to write to forbidden fields ${msg.user.login as string}`, msg.id));
            }
        }
        next();
    }
    private authorizeOperation(operation: string, forbiddenOperations: string[]): boolean {
        return !forbiddenOperations.includes(operation) && this.customOperationLogic(operation);
    }
    private checkInputObj(input: InputType, forbiddenWriteFields: string[]): boolean {
        const dottedInput = dotObj.dot(input) as LooseObject;
        return !(
            Object.keys(dottedInput).some((key) => forbiddenWriteFields.includes(key)) ||
            Object.keys(dottedInput).some((key) => forbiddenWriteFields.includes(key))
        ) && this.customInputLogic(input);
    }
    private hideFields(output: ApiResult<InputType>, hiddenReadFields: string[]): ApiResult<InputType> {
        const doHide = (outputObj: InputType): InputType => {
            const dottedOutputObj = dotObj.dot(outputObj) as LooseObject;
            for (const key of Object.keys(dottedOutputObj)) {
                if (hiddenReadFields.includes(key)) {
                    delete dottedOutputObj[key];
                }
            }
            const result: LooseObject = dotObj.object(dottedOutputObj);
            return result as InputType;
        };
        if (Array.isArray(output)) {
            return output.map(doHide);
        } else if (output === null || typeof output === "boolean") {
            return output;
        } else {
            return doHide(output);
        }
    }
}