import { createServer } from "http";

import { Server } from "socket.io";

import { addPacketId } from "@framework/helpers/communication/socket/middleware";

import { CmsMessage, CmsMessageResponse } from "@framework/types/communication/socket";
import { CrudSearchOptions } from "@framework/types/database/mongo";
import { SocketError } from "@framework/types/errors";
import { LooseObject } from "@framework/types/generic";

import { netBundleApiCall } from "./apiCall";
import { getNetBundleAuthorizer } from "./authorizer";
import { netBundleCrud } from "./crud";
import { netBundleMessageParser } from "./parser";
import { NetBundle } from "./type";

//import { getRoutes } from "./router";

//const routes = getRoutes("/api/settings");
const httpServer = createServer();
const io = new Server(httpServer, {
    transports: ["websocket"]
});

(async () => {
    await netBundleCrud.init();
    const netBundleAuthorizer = await getNetBundleAuthorizer();
    const outputAuthorizer = netBundleAuthorizer.authorizeOutput.bind(netBundleAuthorizer);

    io.on("connection", (socket) => {
        socket.use(addPacketId);
        socket.use(netBundleMessageParser.middleware.bind(netBundleMessageParser));
        socket.use(netBundleAuthorizer.middleware.bind(netBundleAuthorizer));

        socket.on("search", (msg: CmsMessage) => netBundleApiCall.performStandard(socket, msg.id, msg.user, 
            netBundleCrud.search.bind(netBundleCrud, { ...msg?.parsedQuery as CrudSearchOptions }), outputAuthorizer)
        );
        socket.on("aggregate", (msg: CmsMessage) => netBundleApiCall.performStandard(socket, msg.id, msg.user, 
            netBundleCrud.aggregate.bind(netBundleCrud, msg?.parsedQuery?.pipeline as LooseObject[]), outputAuthorizer)
        );
        socket.on("get", (msg: CmsMessage) => netBundleApiCall.performStandard(socket, msg.id, msg.user, 
            netBundleCrud.get.bind(netBundleCrud, msg?.parsedParams?.id as string), outputAuthorizer)
        );
        socket.on("add", (msg: CmsMessage) => netBundleApiCall.performStandard(socket, msg.id, msg.user, 
            netBundleCrud.add.bind(netBundleCrud, msg?.parsedBody?.netBundle as NetBundle), outputAuthorizer)
        );
        socket.on("update", (msg: CmsMessage) => netBundleApiCall.performStandard(socket, msg.id, msg.user, 
            netBundleCrud.update.bind(netBundleCrud, msg?.parsedParams?.id as string, msg?.parsedBody?.netBundle as NetBundle), outputAuthorizer)
        );
        socket.on("delete", (msg: CmsMessage) => netBundleApiCall.performStandard(socket, msg.id, msg.user, 
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
})().then().catch((error) => {
    console.error(`Error while initializing the netBundle service ${String(error)}`);
    process.exit();
});