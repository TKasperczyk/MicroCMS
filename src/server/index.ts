import { createServer } from "http";

import express, { Express, Request, Response } from "express";

import { RouteMapping, SocketPoolEntry } from "@framework/types/communication/socket";

import { Discovery } from "./discovery";

const discovery = new Discovery();
const app: Express = express();

discovery.initServer();

discovery.on("register", (socketPoolEntry: SocketPoolEntry) => {
    console.log("register!", socketPoolEntry);
    socketPoolEntry.interface.forEach((entry: RouteMapping) => {
        switch(entry.method) {
            case "get": {
                app.get(entry.route, (req, res) => {
                    console.log("get req");
                });
                break;
            }
            case "put": {
                app.put(entry.route, (req, res) => {
                    console.log("get put");
                });
                break;
            }
            /*case "get": {
                app.get(entry.route, (req, res) => {
                    console.log("get req");
                });
                break;
            }*/
        }
    });
});

const server = createServer();
server.listen(2000, "127.0.0.1");