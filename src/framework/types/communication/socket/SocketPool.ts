import { Socket } from "socket.io-client";

import { TRouteMapping } from "@framework/types/communication/socket/RouteMapping";

export interface TSocketPoolEntry { interface: TRouteMapping[], socket: Socket, servicePort: number, serviceId: string }
export interface TSocketPool { [key: string]: TSocketPoolEntry }