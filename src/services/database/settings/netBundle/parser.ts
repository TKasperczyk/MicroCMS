"use strict";

import { MessageParser } from "@cmsHelpers/communication/socket";

export class NetBundleMessageParser extends MessageParser { }
export const netBundleMessageParser = new MessageParser("netBundle", true);
