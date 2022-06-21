import { MessageParser } from "@framework/helpers/communication/socket";

//Test

export class NetBundleMessageParser extends MessageParser { }
export const netBundleMessageParser = new MessageParser("netBundle", true);
