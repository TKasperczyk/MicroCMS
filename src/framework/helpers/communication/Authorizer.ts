import * as dotObj from "dot-object";
import { Event } from "socket.io";

import { isObject } from "@framework/helpers/assertions";
import { extractPacketData } from "@framework/helpers/communication/socket/packetData";

import { TApiResult, TAuthorizeMap, TAuthorizeMapOutput } from "@framework/types/communication";
import { TSocketNextFunction , TCmsMessage } from "@framework/types/communication/socket";
import { TSocketError } from "@framework/types/errors";
import { TLooseObject } from "@framework/types/generic";

/*
    TODO: the aggregation operation will allow users to rename fields in the output object and thus bypass the output authorizer
*/

(dotObj.keepArray as boolean) = true; //eslint-disable-line

export class Authorizer<InputType> {
    constructor(authorizeMap: TAuthorizeMap, serviceId: string) {
        this.authorizeMap = TAuthorizeMap.parse(authorizeMap);
        this.serviceId = serviceId;
    }

    public authorizeMap: TAuthorizeMapOutput;
    
    private serviceId: string;

    /* eslint-disable @typescript-eslint/no-unused-vars */
    protected customInputLogic(input: InputType): boolean { return true; }
    protected customOutputLogic(response: TApiResult<InputType>, user: TLooseObject): TApiResult<InputType> | null { return response; }
    protected customOperationLogic(operation: string): boolean { return true; }
    /* eslint-enable @typescript-eslint/no-unused-vars */

    public authorizeOutput(response: TApiResult<InputType>, user: TLooseObject): TApiResult<InputType> {
        if (!user?.login || !user?.group) {
            throw new Error("Malformed or missing user object");
        }
        if (!Array.isArray(response) && typeof response !== "object") {
            return response;
        }

        let result: TApiResult<InputType> = response;

        const groupEntry = this.authorizeMap.group[user.group as string]?.hiddenReadFields;
        const userEntry = this.authorizeMap.group[user.login as string]?.hiddenReadFields;
        if (groupEntry) {
            result = this.hideFields(result, groupEntry);
        }
        if (userEntry) {
            result = this.hideFields(result, userEntry);
        }
        result = this.customOutputLogic(result, user);

        return result;
    }
    public middleware(packet: Event, next: TSocketNextFunction): void {
        const { msg, eventName } = extractPacketData(packet);
        if (!this.checkUserObj(msg)) {
            return next(new TSocketError("Malformed or missing user object in the incoming message", msg.requestId));
        }

        if (!this.canPerformOperation(msg, eventName)) {
            return next(new TSocketError(`A user tried to perform a forbidden operation (${msg.user.login as string}): ${eventName}`, msg.requestId));
        }

        if (!this.canUpdateFields(msg, eventName)) {
            return next(new TSocketError(`A user (${msg.user.login as string}) tried to write to forbidden fields`, msg.requestId));
        }
        next();
    }
    private canUpdateFields(msg: TCmsMessage, eventName: string): boolean {
        const inputObj = msg?.parsedBody[this.serviceId] as InputType;
        if (isObject(inputObj)) {
            const groupEntry = this.authorizeMap.group[msg.user.group as string]?.forbiddenWriteFields;
            const userEntry = this.authorizeMap.group[msg.user.login as string]?.forbiddenWriteFields;
            let groupUpdatePermitted = true, userUpdatePermitted = true;
            if (groupEntry && !groupEntry.excludedOperations?.includes(eventName)) {
                groupUpdatePermitted = this.checkInputObj(inputObj, groupEntry.fields || []);
            }
            if (userEntry && !userEntry.excludedOperations?.includes(eventName)) {
                userUpdatePermitted = this.checkInputObj(inputObj, userEntry.fields || []);
            }
            return (groupUpdatePermitted && userUpdatePermitted);
        } else {
            return true;
        }
    }
    private canPerformOperation(msg: TCmsMessage, eventName: string): boolean {
        const groupOperationPermitted = this.authorizeOperation(eventName, this.authorizeMap.group[msg.user.group as string]?.forbiddenOperations || []);
        const userOperationPermitted = this.authorizeOperation(eventName, this.authorizeMap.user[msg.user.login as string]?.forbiddenOperations || []);
        return (groupOperationPermitted && userOperationPermitted);
    }
    private checkUserObj(msg: TCmsMessage): boolean {
        return (typeof msg?.user?.login === "string" && typeof msg?.user?.group === "string");
    }
    private authorizeOperation(operation: string, forbiddenOperations: string[]): boolean {
        return !forbiddenOperations.includes(operation) && this.customOperationLogic(operation);
    }
    private checkInputObj(input: InputType, forbiddenWriteFields: string[]): boolean {
        const dottedInput = dotObj.dot(input) as TLooseObject;
        return !(
            Object.keys(dottedInput).some((key) => forbiddenWriteFields.includes(key)) ||
            Object.keys(dottedInput).some((key) => forbiddenWriteFields.includes(key))
        ) && this.customInputLogic(input);
    }
    private hideFields(output: TApiResult<InputType>, hiddenReadFields: string[]): TApiResult<InputType> {
        const doHide = (outputObj: InputType): InputType => {
            const dottedOutputObj = dotObj.dot(outputObj) as TLooseObject;
            for (const key of Object.keys(dottedOutputObj)) {
                if (hiddenReadFields.includes(key)) {
                    delete dottedOutputObj[key];
                }
            }
            const result: TLooseObject = dotObj.object(dottedOutputObj);
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