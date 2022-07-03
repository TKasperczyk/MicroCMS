import { Event } from "socket.io";

import { TSocketNextFunction } from "@framework/types/communication/socket/SocketNextFunction";

export type TSocketMiddleware = (packet: Event, next: TSocketNextFunction) => void;