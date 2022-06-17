"use strict";

import { createServer } from "http";
import { Server } from "socket.io";

import { ApiCall } from "@cmsHelpers/communication/socket";
import { addPacketId } from "@cmsHelpers/communication/socket/middleware";
import { SocketError } from "@cmsTypes/errors";
import { CmsMessageResponse } from "@cmsTypes/index";

import { netBundleAuthorizer } from "./authorizer";
import { netBundleCrud } from "./crud";
import { netBundleMessageParser } from "./parser";
import { getRoutes } from "./router";
import { NetBundle } from "./type";

const routes = getRoutes("/api/settings");
const apiCall = new ApiCall<NetBundle>();
const outputAuthorizer = netBundleAuthorizer.authorizeOutput.bind(netBundleAuthorizer);

const httpServer = createServer();
const io = new Server(httpServer, {
    transports: ["websocket"]
});

(async () => {
    await netBundleCrud.init();

    io.on("connection", (socket) => {
        socket.use(addPacketId);
        socket.use(netBundleMessageParser.middleware.bind(netBundleMessageParser));
        socket.use(netBundleAuthorizer.middleware.bind(netBundleAuthorizer));


        socket.on("search", (msg) => apiCall.performStandard(socket, msg.id, msg.user, netBundleCrud.search.bind(netBundleCrud, {...msg?.parsedQuery}), outputAuthorizer));
        socket.on("aggregate", (msg) => apiCall.performStandard(socket, msg.id, msg.user, netBundleCrud.aggregate.bind(netBundleCrud, msg?.parsedQuery?.pipeline), outputAuthorizer));
        socket.on("get", (msg) => apiCall.performStandard(socket, msg.id, msg.user, netBundleCrud.get.bind(netBundleCrud, msg?.parsedParams?.id), outputAuthorizer));
        socket.on("add", (msg) => apiCall.performStandard(socket, msg.id, msg.user, netBundleCrud.add.bind(netBundleCrud, msg?.parsedBody?.netBundle), outputAuthorizer));
        socket.on("update", (msg) => apiCall.performStandard(socket, msg.id, msg.user, netBundleCrud.update.bind(netBundleCrud, msg?.parsedParams?.id, msg?.parsedBody?.netBundle), outputAuthorizer));
        socket.on("delete", (msg) => apiCall.performStandard(socket, msg.id, msg.user, netBundleCrud.delete.bind(netBundleCrud, msg?.parsedParams?.id), outputAuthorizer));

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