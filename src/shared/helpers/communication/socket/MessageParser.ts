"use strict";

import { CmsMessage, LooseObject } from "../../../types";
import { Event } from "socket.io";
import { SocketError } from "../../../types/errors/SocketError";
import { IncomingParser } from "../IncomingParser";
import { extractPacketData } from "./packetData";

export class MessageParser extends IncomingParser {
    public middleware(packet: Event, next: (err?: Error | undefined) => void): void {
        const { eventName, msg } = extractPacketData(packet);
        try {
            packet[1] = {...packet[1], ...this.parseMessage(msg as CmsMessage, eventName)};
        } catch (error) {
            return next(new SocketError(String(error), msg.id));
        }
        next();
    };
    public parseMessage(msg: LooseObject, crudMethodName: string): CmsMessage {
        msg.parsedQuery = this.parseQuery(msg.query);
        msg.parsedBody = this.parseBody(msg.body);
        msg.parsedParams = this.parseParams(msg.params);

        if (this.crudRequiredArgsEnabled && !this.checkCrudRequiredArgs(msg, crudMethodName)) {
            throw new Error(`Incomplete or incorrect arguments in the incoming request: ${this.lastError}`);
        }
        return msg as CmsMessage;
    };
};