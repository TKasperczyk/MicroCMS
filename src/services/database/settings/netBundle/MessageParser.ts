import { MessageParser } from "@framework/helpers/communication/socket";

import { TCmsMessage, TCmsPreMessage } from "@framework/types/communication/socket";

export class NetBundleMessageParser extends MessageParser {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    preParse(msg: TCmsPreMessage, eventName: string): void { return; }
    postParse(msg: TCmsMessage | TCmsPreMessage, eventName: string, error: string | null): void { return; }
    /* eslint-enable @typescript-eslint/no-unused-vars */
}
