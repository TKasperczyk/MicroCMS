import { MessageParser } from "@framework/helpers/communication/socket";

import { CmsMessage, CmsPreMessage } from "@framework/types/communication/socket";

export class NetBundleMessageParser extends MessageParser {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    preParse(msg: CmsPreMessage, eventName: string): void { return; }
    postParse(msg: CmsMessage | CmsPreMessage, eventName: string, error: string | null): void { return; }
    /* eslint-enable @typescript-eslint/no-unused-vars */
}
