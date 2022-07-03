import { Event } from "socket.io";

import { TSocketNextFunction } from "@framework/types/communication/socket";

export const shutdown = (packet: Event, next: TSocketNextFunction): void => {
    if (packet.length > 0 && packet[0] === "shutdown") {
        console.error("Force shutdown");
        process.exit();
    }
    next();
};