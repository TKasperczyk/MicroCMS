import { randomUUID } from "crypto";

import { Event } from "socket.io";

import { SocketNextFunction } from "@framework/types/communication/socket";

export const addPacketId = (packet: Event, next: SocketNextFunction): void => {
    if (packet.length > 0 && typeof packet[1] === "object") {
        packet[1].id = packet[1].id ? packet[1].id as string : randomUUID(); //eslint-disable-line @typescript-eslint/no-unsafe-member-access
    }
    next();
};