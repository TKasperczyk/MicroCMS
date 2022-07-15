import { randomUUID } from "crypto";

import { Event } from "socket.io";

import { isObject } from "@framework/helpers/assertions/isObject";

import { TSocketNextFunction } from "@framework/types/communication/socket";

export const addRequestId = (packet: Event, next: TSocketNextFunction): void => {
    if (packet.length > 0 && isObject(packet[1])) { // This ensures that we will be able to access the immediate properties of packet[1]
        packet[1].requestId = packet[1].requestId ? packet[1].requestId as string : randomUUID(); //eslint-disable-line @typescript-eslint/no-unsafe-member-access
    }
    next();
};