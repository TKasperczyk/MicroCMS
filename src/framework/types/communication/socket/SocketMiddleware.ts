import { Event } from "socket.io";

import { SocketNextFunction } from "@framework/types/communication/socket/SocketNextFunction";

export type SocketMiddleware = (packet: Event, next: SocketNextFunction) => void;