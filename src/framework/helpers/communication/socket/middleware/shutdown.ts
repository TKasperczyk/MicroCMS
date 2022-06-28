import { Event } from "socket.io";

import { SocketNextFunction } from "@framework/types/communication/socket";

export const shutdown = (packet: Event, next: SocketNextFunction): void => {
    if (packet.length > 0 && packet[0] === "shutdown") {
        console.error("Force shutdown");
        process.exit();
    }
    next();
};