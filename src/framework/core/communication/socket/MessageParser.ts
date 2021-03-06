import { Logger, LoggerOptions } from "pino";
import { Event } from "socket.io";

import { IncomingParser } from "@framework/core/communication/IncomingParser";
import { getErrorMessage } from "@framework/helpers";
import { extractUserData } from "@framework/helpers/communication";
import { extractPrePacketData } from "@framework/helpers/communication/socket";

import { TCmsMessage, TCmsPreMessage, TSocketNextFunction } from "@framework/types/communication/socket";
import { TSocketError } from "@framework/types/errors";
import { TLooseObject } from "@framework/types/generic";

export class MessageParser extends IncomingParser {
    constructor(rl: Logger<LoggerOptions>, typeName: string, crudRequiredArgsEnabled = false) {
        super(typeName, crudRequiredArgsEnabled);
        this.rl = rl;
    }

    protected rl: Logger<LoggerOptions>;
    /* eslint-disable @typescript-eslint/no-unused-vars */
    protected preParse(msg: TCmsPreMessage, eventName: string): void { return; }
    protected postParse(msg: TCmsMessage | TCmsPreMessage, eventName: string, error: string | null): void { return; }
    /* eslint-enable @typescript-eslint/no-unused-vars */

    public middleware(packet: Event, next: TSocketNextFunction): void {
        let eventName: string, preMsg: TCmsPreMessage, msg: TCmsMessage;
        try {
            ({ eventName, preMsg } = extractPrePacketData(packet)); //This includes TCmsPreMessage.parse(packet[1])
        } catch (error) {
            this.rl.error({ packet }, `Error while extracting data from an incoming packet: ${getErrorMessage(error)}`);
            return next(new TSocketError(String(error), ""));
        }
        this.rl.debug({ requestId: preMsg?.requestId, preMsg: { ...preMsg, user: extractUserData(preMsg?.user) } }, `Parsing an incoming message for ${eventName}`); //eslint-disable-line @typescript-eslint/no-unsafe-assignment
        try {
            msg = this.parseMessage(preMsg, eventName);
        } catch (error) {
            this.rl.error({ requestId: preMsg.requestId, preMsg }, `Error while parsing an incoming message for ${eventName}: ${getErrorMessage(error)}`);
            this.postParse(preMsg, eventName, String(error));
            return next(new TSocketError(String(error), preMsg.requestId));
        }
        packet[1] = msg;
        this.postParse(msg, eventName, null);
        this.rl.debug({ requestId: msg.requestId, msg }, `Successfully parsed an incoming message for ${eventName}`);
        next();
    }
    public parseMessage(preMsg: TCmsPreMessage, eventName: string): TCmsMessage {
        this.preParse(preMsg, eventName);
        const msgToConstruct: TLooseObject = { ...preMsg };
        msgToConstruct.parsedQuery = this.parseQuery(msgToConstruct.query as string | TLooseObject);
        msgToConstruct.parsedBody = this.parseBody(msgToConstruct.body as string | TLooseObject);
        msgToConstruct.parsedParams = this.parseParams(msgToConstruct.params as string | TLooseObject);

        if (this.crudRequiredArgsEnabled && !this.checkCrudRequiredArgs(msgToConstruct, eventName)) {
            throw new Error(`Incomplete or incorrect arguments in the incoming request: ${this.lastError}`);
        }
        if (!this.checkUserPresence(msgToConstruct)) {
            throw new Error(`Malformed or missing user object in the request: ${this.lastError}`);
        }
        try {
            return TCmsMessage.parse(msgToConstruct);
        } catch (error) {
            this.rl.error({ preMsg, msgToConstruct },`Error while parsing an incoming TCmsMessage: ${getErrorMessage(error)}. Returning malformed`);
            return msgToConstruct as TCmsMessage;
        }
    }
}