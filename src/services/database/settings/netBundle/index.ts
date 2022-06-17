"use strict";

import { createServer } from "http";

import { Server } from "socket.io";

import { ApiCall } from "@cmsHelpers/communication/socket";
import { addPacketId } from "@cmsHelpers/communication/socket/middleware";
import { SocketError } from "@cmsTypes/errors";
import { CmsMessage, CmsMessageResponse, CrudMongoSearchOptions, LooseObject } from "@cmsTypes/index";

import { netBundleAuthorizer } from "./authorizer";
import { netBundleCrud } from "./crud";
import { netBundleMessageParser } from "./parser";
import { NetBundle } from "./type";

//import { getRoutes } from "./router";

//const routes = getRoutes("/api/settings");
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


        socket.on("search", (msg: CmsMessage) => apiCall.performStandard(socket, msg.id, msg.user, 
            netBundleCrud.search.bind(netBundleCrud, { ...msg?.parsedQuery as CrudMongoSearchOptions }), outputAuthorizer)
        );
        socket.on("aggregate", (msg: CmsMessage) => apiCall.performStandard(socket, msg.id, msg.user, 
            netBundleCrud.aggregate.bind(netBundleCrud, msg?.parsedQuery?.pipeline as LooseObject[]), outputAuthorizer)
        );
        socket.on("get", (msg: CmsMessage) => apiCall.performStandard(socket, msg.id, msg.user, 
            netBundleCrud.get.bind(netBundleCrud, msg?.parsedParams?.id as string), outputAuthorizer)
        );
        socket.on("add", (msg: CmsMessage) => apiCall.performStandard(socket, msg.id, msg.user, 
            netBundleCrud.add.bind(netBundleCrud, msg?.parsedBody?.netBundle as NetBundle), outputAuthorizer)
        );
        socket.on("update", (msg: CmsMessage) => apiCall.performStandard(socket, msg.id, msg.user, 
            netBundleCrud.update.bind(netBundleCrud, msg?.parsedParams?.id as string, msg?.parsedBody?.netBundle as NetBundle), outputAuthorizer)
        );
        socket.on("delete", (msg: CmsMessage) => apiCall.performStandard(socket, msg.id, msg.user, 
            netBundleCrud.delete.bind(netBundleCrud, msg?.parsedParams?.id as string), outputAuthorizer)
        );

        socket.on("error", (error) => {
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
})().catch(() => {
    //TODO
});