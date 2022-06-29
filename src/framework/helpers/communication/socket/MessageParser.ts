import { Logger, LoggerOptions } from "pino";
import { Event } from "socket.io";

import { IncomingParser } from "@framework/helpers/communication/IncomingParser";

import { CmsMessage, CmsPreMessage, SocketNextFunction } from "@framework/types/communication/socket";
import { CrudOperations } from "@framework/types/database";
import { SocketError } from "@framework/types/errors";
import { LooseObject } from "@framework/types/generic";

import { extractPrePacketData } from "./packetData";

export abstract class MessageParser extends IncomingParser {
    constructor(rl: Logger<LoggerOptions>, typeName: string, crudRequiredArgsEnabled = false) {
        super(typeName, crudRequiredArgsEnabled);
        this.rl = rl;
    }

    protected rl: Logger<LoggerOptions>;

    protected abstract preParse(msg: CmsPreMessage, eventName: string): void;
    protected abstract postParse(msg: CmsMessage | CmsPreMessage, eventName: string, error: string | null): void;

    public middleware(packet: Event, next: SocketNextFunction): void {
        let eventName: string, preMsg: CmsPreMessage, msg: CmsMessage;
        try {
            ({ eventName, preMsg } = extractPrePacketData(packet));
        } catch (error) {
            this.rl.error({ packet }, `Error while extracting data from an incoming packet: ${String(error)}`);
            return next(new SocketError(String(error), ""));
        }
        this.rl.debug({ requestId: preMsg.requestId || null, preMsg }, `Parsing an incoming message for ${eventName}`); //eslint-disable-line @typescript-eslint/no-unsafe-assignment
        try {
            msg = this.parseMessage(preMsg, eventName);
        } catch (error) {
            this.rl.error({ requestId: preMsg.requestId, preMsg }, `Error while parsing an incoming message for ${eventName}: ${String(error)}`);
            this.postParse(preMsg, eventName, String(error));
            return next(new SocketError(String(error), preMsg.requestId));
        }
        packet[1] = msg;
        this.postParse(msg, eventName, null);
        this.rl.debug({ requestId: msg.requestId, msg }, `Successfully parsed an incoming message for ${eventName}`);
        next();
    }
    public parseMessage(preMsg: CmsPreMessage, eventName: string): CmsMessage {
        this.preParse(preMsg, eventName);
        const msgToConstruct: LooseObject = { ...preMsg };
        msgToConstruct.parsedQuery = this.parseQuery(msgToConstruct.query as string | LooseObject);
        msgToConstruct.parsedBody = this.parseBody(msgToConstruct.body as string | LooseObject);
        msgToConstruct.parsedParams = this.parseParams(msgToConstruct.params as string | LooseObject);

        if (this.crudRequiredArgsEnabled && !this.checkCrudRequiredArgs(msgToConstruct, eventName as keyof CrudOperations)) {
            throw new Error(`Incomplete or incorrect arguments in the incoming request: ${this.lastError}`);
        }
        if (!this.checkUserPresence(msgToConstruct)) {
            throw new Error(`Malformed or missing user object in the request: ${this.lastError}`);
        }
        try {
            return CmsMessage.parse(msgToConstruct);
        } catch (error) {
            this.rl.error({ preMsg, msgToConstruct },`Error while parsing an incoming CmsMessage: ${String(error)}. Returning malformed`);
            return msgToConstruct as CmsMessage;
        }
    }
}