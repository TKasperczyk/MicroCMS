import { Socket } from "socket.io-client";

import { RouteMapping } from "./RouteMapping";

export interface SocketPoolEntry { interface: RouteMapping[], socket: Socket, servicePort: number, serviceId: string }
export interface SocketPool { [key: string]: SocketPoolEntry }