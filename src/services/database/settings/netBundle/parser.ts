"use strict";

import { MessageParser } from "../../../../shared/helpers/communication/socket";

export class NetBundleMessageParser extends MessageParser { };
export const netBundleMessageParser = new MessageParser("netBundle", true);
