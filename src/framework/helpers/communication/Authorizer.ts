import * as dotObj from "dot-object";
import { Event } from "socket.io";

import { extractPacketData } from "@framework/helpers/communication/socket/packetData";

import { ApiResult } from "@framework/types/communication/ApiResult";
import { AuthorizeMap } from "@framework/types/communication/AuthorizeMap";
import { CmsMessage } from "@framework/types/communication/socket";
import { SocketNextFunction } from "@framework/types/communication/socket/SocketNextFunction";
import { SocketError } from "@framework/types/errors";
import { LooseObject } from "@framework/types/generic";

/*
    TODO: the aggregation operation will allow users to rename fields in the output object and thus bypass the output authorizer
*/

(dotObj.keepArray as boolean) = true; //eslint-disable-line

export abstract class Authorizer<InputType> {
    constructor(authorizeMap: AuthorizeMap, typeName: string) {
        this.authorizeMap = authorizeMap;
        this.typeName = typeName;
    }

    private authorizeMap: AuthorizeMap;
    private typeName: string;

    protected abstract customInputLogic(input: InputType): boolean;
    protected abstract customOutputLogic(response: ApiResult<InputType>, user: LooseObject): ApiResult<InputType> | null;
    protected abstract customOperationLogic(operation: string): boolean;

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
        if (!this.checkUserObj(msg)) {
            return next(new SocketError("Malformed or missing user object in the incoming message", msg.requestId));
        }

        if (!this.canPerformOperation(msg, eventName)) {
            return next(new SocketError(`A user tried to perform a forbidden operation (${msg.user.login as string}): ${eventName}`, msg.requestId));
        }

        if (!this.canUpdateFields(msg)) {
            return next(new SocketError(`A user (${msg.user.login as string}) tried to write to forbidden fields`, msg.requestId));
        }
        next();
    }
    private canUpdateFields(msg: CmsMessage): boolean {
        const inputObj = msg?.parsedBody[this.typeName] as InputType;
        if (typeof inputObj === "object") {
            const groupUpdatePermitted = this.checkInputObj(inputObj, this.authorizeMap.group[msg.user.group as string]?.forbiddenWriteFields || []);
            const userUpdatePermitted = this.checkInputObj(inputObj, this.authorizeMap.user[msg.user.login as string]?.forbiddenWriteFields || []);
            return (groupUpdatePermitted && userUpdatePermitted);
        } else {
            return true;
        }
    }
    private canPerformOperation(msg: CmsMessage, eventName: string): boolean {
        const groupOperationPermitted = this.authorizeOperation(eventName, this.authorizeMap.group[msg.user.group as string]?.forbiddenOperations || []);
        const userOperationPermitted = this.authorizeOperation(eventName, this.authorizeMap.user[msg.user.login as string]?.forbiddenOperations || []);
        return (groupOperationPermitted && userOperationPermitted);
    }
    private checkUserObj(msg: CmsMessage): boolean {
        return (typeof msg?.user?.login === "string" && typeof msg?.user?.group === "string");
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