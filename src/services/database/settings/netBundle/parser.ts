"use strict";

import { MessageParser } from "@framework/helpers/communication/socket";

export class NetBundleMessageParser extends MessageParser { }
export const netBundleMessageParser = new MessageParser("netBundle", true);
