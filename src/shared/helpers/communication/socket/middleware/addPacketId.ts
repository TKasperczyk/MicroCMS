"use strict";

import { randomUUID } from "crypto";
import { Event } from "socket.io";

import { SocketNextFunction } from "@cmsTypes/index";

export const addPacketId = (packet: Event, next: SocketNextFunction): void => {
    if (packet.length > 0 && typeof packet[1] === "object"){
        packet[1].id = packet[1].id ? packet[1].id : randomUUID();
    }
    next();
};