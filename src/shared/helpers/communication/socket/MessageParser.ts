"use strict";

import { Event } from "socket.io";

import { IncomingParser } from "@cmsHelpers/communication";
import { SocketError } from "@cmsTypes/errors";
import { CmsMessage, LooseObject, SocketNextFunction } from "@cmsTypes/index";

import { extractPacketData } from "./packetData";

export class MessageParser extends IncomingParser {
    public middleware(packet: Event, next: SocketNextFunction): void {
        const { eventName, msg } = extractPacketData(packet);
        try {
            packet[1] = {...packet[1], ...this.parseMessage(msg, eventName)} as CmsMessage;
        } catch (error) {
            return next(new SocketError(String(error), msg.id));
        }
        next();
    }
    public parseMessage(msg: LooseObject, crudMethodName: string): CmsMessage {
        msg.parsedQuery = this.parseQuery(msg.query);
        msg.parsedBody = this.parseBody(msg.body);
        msg.parsedParams = this.parseParams(msg.params);

        if (this.crudRequiredArgsEnabled && !this.checkCrudRequiredArgs(msg, crudMethodName)) {
            throw new Error(`Incomplete or incorrect arguments in the incoming request: ${this.lastError}`);
        }
        if (!this.checkUserPresence(msg)) {
            throw new Error(`Malformed or missing user object in the request: ${this.lastError}`);
        }
        return msg as CmsMessage;
    }
}