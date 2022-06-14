"use strict";

import { Event, Socket } from "socket.io";
import * as dotObj from "dot-object";
import { AuthorizeMap, AuthorizeMapEntry, CmsMessage, LooseObject, ServiceFactory } from "../../../../shared/types";
import { extractPacketData, savePacketData } from "../../../../shared/helpers/communication/socket";
import { SocketError } from "../../../../shared/types/errors";


export class Authorizer<InputType> {
    constructor(authorizeMap: AuthorizeMap, typeName: string, factory: ServiceFactory<InputType>, defaultOpen: boolean = true) {
        this.authorizeMap = authorizeMap;
        this.typeName = typeName;
        this.defaultOpen = true;
        this.factory = factory;
    }

    private authorizeMap: AuthorizeMap;
    private typeName: string;
    private defaultOpen: boolean;
    private factory: ServiceFactory<InputType>;

    public middleware(packet: Event, next: (err?: Error | undefined) => void): void {
        const { msg, eventName } = extractPacketData(packet);
        if (!msg?.user?.login){
            return next(new SocketError("Error: the incoming message doesn't include the user object", msg.id));
        }
        const dottedMsgObj = dotObj.dot(msg[this.typeName as keyof CmsMessage]);
        for (const login of Object.keys(this.authorizeMap.user)){
            const possibleError = this.authorizeObject(msg, dottedMsgObj, eventName, this.authorizeMap.user[login]);
            if (possibleError instanceof SocketError){
                return next(possibleError);
            }
            packet = savePacketData({msg: {
                ...msg, 
                [this.typeName]: this.hideFields(dottedMsgObj, this.authorizeMap.user[login].hiddenReadFields, eventName);
            }, eventName}, packet);

        }
        for (const groupName of Object.keys(this.authorizeMap.group)){
            const result = this.authorizeObject(msg, eventName, this.authorizeMap.group[groupName], packet);
            if (result instanceof SocketError){
                next(result);
            } else {
                packet = result;
            }
        }
        next();
    }

    private authorizeObject(msg: CmsMessage, dottedMsgObj: LooseObject, eventName: string, mapEntry: AuthorizeMapEntry): SocketError | void{
        if (mapEntry.forbiddenOperations.includes(eventName)){
            return new SocketError(`Error: forbidden operation ${eventName} for user ${msg?.user?.login} in type ${this.typeName}`, msg.id);
        }
        if (!msg[this.typeName as keyof CmsMessage]){
            return;
        }
        for (let key of Object.keys(dottedMsgObj)){
            if (eventName === "update"){
                if (mapEntry.forbiddenWriteFields.includes(key)){
                    return new SocketError(`Error: The user ${msg?.user?.login} tried to update a forbidden field: ${key} in ${this.typeName}`, msg.id);
                }
            }
        }
    }
    private hideFields(dottedMsgObj: LooseObject, hiddenReadFields: string[], eventName: string): LooseObject {
        for (let key of Object.keys(dottedMsgObj)){
            if (eventName == "update"){
                if (hiddenReadFields.includes(key)){
                    delete dottedMsgObj[key];
                }
            }
        }
        return dotObj.object(dottedMsgObj);
        //return savePacketData({msg: {...msg, [this.typeName]: dotObj.object(dottedMsgObj)}, eventName}, packet);
    }
};