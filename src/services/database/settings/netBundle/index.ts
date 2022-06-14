"use strict";

import { createServer } from "http";
import { Server } from "socket.io";

import { getRoutes } from "./router";
import { NetBundle } from "./type";
import { netBundleCrud } from "./crud";
import { netBundleMessageParser } from "./parser";

import { ApiCall } from "../../../../shared/helpers/communication/socket";
import { addPacketId } from "../../../../shared/helpers/communication/socket/middleware";
import { SocketError } from "../../../../shared/types/errors/SocketError";
import { CmsMessageResponse } from "../../../../shared/types";

const routes = getRoutes("/api/settings");
const apiCall = new ApiCall<NetBundle>();

const httpServer = createServer();
const io = new Server(httpServer, {
    transports: ["websocket"]
});

(async () => {
    await netBundleCrud.init();

    io.on("connection", (socket) => {
        socket.use(addPacketId);
        socket.use(netBundleMessageParser.middleware.bind(netBundleMessageParser));
        socket.on("search", async (msg) => apiCall.performStandard(socket, msg.id, netBundleCrud.search.bind(netBundleCrud, {...msg?.parsedQuery})));
        socket.on("aggregate", async (msg) => apiCall.performStandard(socket, msg.id, netBundleCrud.aggregate.bind(netBundleCrud, msg?.parsedQuery?.pipeline)));
        socket.on("get", async (msg) => apiCall.performStandard(socket, msg.id, netBundleCrud.get.bind(netBundleCrud, msg?.parsedParams?.id)));
        socket.on("add", async (msg) => apiCall.performStandard(socket, msg.id, netBundleCrud.add.bind(netBundleCrud, msg?.parsedBody?.netBundle)));
        socket.on("update", async (msg) => apiCall.performStandard(socket, msg.id, netBundleCrud.update.bind(netBundleCrud, msg?.parsedParams?.id, msg?.parsedBody?.netBundle)));
        socket.on("delete", async (msg) => apiCall.performStandard(socket, msg.id, netBundleCrud.delete.bind(netBundleCrud, msg?.parsedParams?.id)));

        socket.on("error", async (error) => {
            const socketError = error as SocketError;
            socket.emit("response", {
                status: false,
                data: null,
                error: socketError.message,
                returnCode: 500,
                id: socketError.id
            } as CmsMessageResponse);
        });
    });

    httpServer.listen(4000, "127.0.0.1");
})();