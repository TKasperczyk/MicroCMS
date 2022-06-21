import { Socket } from "socket.io-client";

import { RouteMapping } from "./RouteMapping";

export interface SocketPoolEntry { interface: RouteMapping[], socket: Socket }
export interface SocketPool { [key: string]: SocketPoolEntry }