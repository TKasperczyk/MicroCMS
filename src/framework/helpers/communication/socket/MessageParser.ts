import { Event } from "socket.io";

import { IncomingParser } from "@framework/helpers/communication/IncomingParser";

import { CmsMessage, SocketNextFunction } from "@framework/types/communication/socket";
import { CrudOperations } from "@framework/types/database";
import { SocketError } from "@framework/types/errors";
import { LooseObject } from "@framework/types/generic";

import { extractPacketData } from "./packetData";

export class MessageParser extends IncomingParser {
    public middleware(packet: Event, next: SocketNextFunction): void {
        const { eventName, msg } = extractPacketData(packet);
        try {
            packet[1] = { ...packet[1], ...this.parseMessage(msg, eventName as keyof CrudOperations) } as CmsMessage;
        } catch (error) {
            return next(new SocketError(String(error), msg.id));
        }
        next();
    }
    public parseMessage(msg: LooseObject, crudMethodName: keyof CrudOperations): CmsMessage {
        msg.parsedQuery = this.parseQuery(msg.query as string | LooseObject);
        msg.parsedBody = this.parseBody(msg.body as string | LooseObject);
        msg.parsedParams = this.parseParams(msg.params as string | LooseObject);

        if (this.crudRequiredArgsEnabled && !this.checkCrudRequiredArgs(msg, crudMethodName)) {
            throw new Error(`Incomplete or incorrect arguments in the incoming request: ${this.lastError}`);
        }
        if (!this.checkUserPresence(msg)) {
            throw new Error(`Malformed or missing user object in the request: ${this.lastError}`);
        }
        return msg as CmsMessage;
    }
}