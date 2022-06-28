import { MessageParser } from "@framework/helpers/communication/socket";
import { reqLogger } from "@framework/logger";

import { CmsMessage } from "@framework/types/communication/socket";
import { LooseObject } from "@framework/types/generic";

const rl = reqLogger("netBundle");

export class NetBundleMessageParser extends MessageParser {
    preParse(msg: LooseObject, eventName: string): void {
        rl.debug({ requestId: msg?.requestId || null, msg }, `Parsing an incoming message for ${eventName}`); //eslint-disable-line @typescript-eslint/no-unsafe-assignment
    }
    postParse(msg: CmsMessage, eventName: string, error: string | null): void {
        if (error === null) {
            rl.debug({ requestId: msg?.requestId, msg }, `Successfully parsed an incoming message for ${eventName}`);
        } else {
            rl.error({ requestId: msg?.requestId, msg }, `Error while parsing an incoming message for ${eventName}: ${error}`);
        }
    }
}
export const netBundleMessageParser = new NetBundleMessageParser("netBundle", true);
