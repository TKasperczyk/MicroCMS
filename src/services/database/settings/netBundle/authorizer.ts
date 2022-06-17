"use strict";

import * as dotObj from "dot-object";
import { Event } from "socket.io";

import { extractPacketData } from "@cmsHelpers/communication/socket";
import { SocketError } from "@cmsTypes/errors";
import { ApiResultType, AuthorizeMap, LooseObject, ServiceFactory, SocketNextFunction } from "@cmsTypes/index";

import { createNetBundle } from "./factory";
import { NetBundle } from "./type";

/*
    TODO: the aggregation operation will allow users to rename fields in the output object and thus bypass the output authorizer
*/

(dotObj.keepArray as boolean) = true;

const netBundleAuthorizeMap: AuthorizeMap = {
    user: {
        "test": {
            hiddenReadFields: [],
            forbiddenWriteFields: [],
            forbiddenOperations: []
        }
    },
    group: {
        "testGroup": {
            hiddenReadFields: ["name"],
            forbiddenWriteFields: ["name"],
            forbiddenOperations: []
        }
    }
};

export class Authorizer<InputType> {
    constructor(authorizeMap: AuthorizeMap, typeName: string, factory: ServiceFactory<InputType>, defaultOpen: boolean = true) {
        this.authorizeMap = authorizeMap;
        this.typeName = typeName;
        this.defaultOpen = defaultOpen;
        this.factory = factory;
    }

    private authorizeMap: AuthorizeMap;
    private typeName: string;
    private defaultOpen: boolean;
    private factory: ServiceFactory<InputType>;

    public authorizeOutput(response: ApiResultType<InputType>, user: LooseObject): ApiResultType<InputType> {
        if (!user?.login || !user?.group){
            throw new Error("Malformed or missing user object");
        }
        if (!Array.isArray(response) && typeof response !== "object"){
            return response;
        }
        let result = response;
        result = this.hideFields(result, this.authorizeMap.group[user.group]?.hiddenReadFields || []);
        result = this.hideFields(result, this.authorizeMap.user[user.login]?.hiddenReadFields || []);
        return result;
    }

    public middleware(packet: Event, next: SocketNextFunction): void {
        const { msg, eventName } = extractPacketData(packet);
        if (!msg?.user?.login || !msg?.user?.group){
            return next(new SocketError("Malformed or missing user object in the incoming message", msg.id));
        }

        if (
            !this.authorizeOperation(eventName, this.authorizeMap.group[msg.user.group]?.forbiddenOperations || []) ||
            !this.authorizeOperation(eventName, this.authorizeMap.user[msg.user.login]?.forbiddenOperations || [])
        ) {
            return next(new SocketError(`A user tried to perform a forbidden operation ${msg.user.login}: ${eventName}`, msg.id));
        }

        const inputObj = msg?.parsedBody[this.typeName] as InputType;
        if (typeof inputObj === "object"){
            if (
                !this.checkInputObj(inputObj, this.authorizeMap.group[msg.user.group]?.forbiddenWriteFields || []) ||
                !this.checkInputObj(inputObj, this.authorizeMap.user[msg.user.login]?.forbiddenWriteFields || [])
            ) {
                return next(new SocketError(`A user tried to write to forbidden fields ${msg.user.login}`, msg.id));
            }
        }
        next();
    }
    private authorizeOperation(operation: string, forbiddenOperations: string[]): boolean {
        return !forbiddenOperations.includes(operation);
    }
    private checkInputObj(input: InputType, forbiddenWriteFields: string[]): boolean {
        const dottedInput = dotObj.dot(input);
        return !(
            Object.keys(dottedInput).some((key) => forbiddenWriteFields.includes(key)) ||
            Object.keys(dottedInput).some((key) => forbiddenWriteFields.includes(key))
        );
    }
    private hideFields(output: ApiResultType<InputType>, hiddenReadFields: string[]): ApiResultType<InputType> {
        const doHide = (outputObj: InputType): InputType => {
            const dottedOutputObj = dotObj.dot(outputObj);
            for (const key of Object.keys(dottedOutputObj)){
                if (hiddenReadFields.includes(key)){
                    delete dottedOutputObj[key as keyof InputType];
                }
            }
            const result: LooseObject = dotObj.object(dottedOutputObj);
            return result as InputType;
        };
        if (Array.isArray(output)){
            return output.map(doHide);
        } else {
            return doHide(output);
        }
    }
};

export const netBundleAuthorizer = new Authorizer<NetBundle>(netBundleAuthorizeMap, "netBundle", createNetBundle, true);