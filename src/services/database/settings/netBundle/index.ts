import { createServer } from "http";

import { Server } from "socket.io";

import { appLogger } from "@framework";
import { addPacketId, shutdown } from "@framework/helpers/communication/socket/middleware";
import { reannounce } from "@framework/helpers/service";

import { CmsMessage, CmsMessageResponse } from "@framework/types/communication/socket";
import { CrudSearchOptions } from "@framework/types/database/mongo";
import { SocketError } from "@framework/types/errors";
import { LooseObject } from "@framework/types/generic";

import { netBundleAnnounce } from "./announce";
import { netBundleApiCall } from "./apiCall";
import { getNetBundleAuthorizer, NetBundleAuthorizer } from "./authorizer";
import { netBundleCrud } from "./crud";
import { netBundleMessageParser } from "./parser";
import { getNetBundleRouteMappings } from "./router";
import { NetBundle } from "./type";

const ml = appLogger("netBundle");

const routeMappings = getNetBundleRouteMappings("/settings/netBundle");
const httpServer = createServer();
const io = new Server(httpServer, {
    transports: ["websocket"]
});

(async () => {
    let netBundleAuthorizer: NetBundleAuthorizer;
    try {
        await netBundleCrud.init();
        netBundleAuthorizer = await getNetBundleAuthorizer();
    } catch (error) {
        ml.error(`Error while initializing the service: ${String(error)}`);
        process.exit();
    }
    const outputAuthorizer = netBundleAuthorizer.authorizeOutput.bind(netBundleAuthorizer);

    io.on("connection", (socket) => {
        ml.info("The socket is connected with the main server");
        socket.use(shutdown);
        socket.use(addPacketId);
        socket.use(netBundleMessageParser.middleware.bind(netBundleMessageParser));
        socket.use(netBundleAuthorizer.middleware.bind(netBundleAuthorizer));

        const callbackFactories = {
            "search": (msg: CmsMessage) => netBundleCrud.search.bind(netBundleCrud, { ...msg?.parsedQuery as CrudSearchOptions }),
            "aggregate": (msg: CmsMessage) => netBundleCrud.aggregate.bind(netBundleCrud, msg?.parsedQuery.pipeline as LooseObject[]),
            "get": (msg: CmsMessage) => netBundleCrud.get.bind(netBundleCrud, msg?.parsedParams?.id as string),
            "add": (msg: CmsMessage) => netBundleCrud.add.bind(netBundleCrud, msg?.parsedBody?.netBundle as NetBundle),
            "update": (msg: CmsMessage) => netBundleCrud.update.bind(netBundleCrud, msg?.parsedParams?.id as string, msg?.parsedBody?.netBundle as NetBundle),
            "delete": (msg: CmsMessage) => netBundleCrud.delete.bind(netBundleCrud, msg?.parsedParams?.id as string)
        };
        for (const eventName of Object.keys(callbackFactories)) {
            const callbackFactoriesKey = eventName as keyof typeof callbackFactories;
            ml.debug(`Launching a listener for event: ${eventName}`);
            socket.on(eventName, (msg: CmsMessage) => netBundleApiCall.performStandard(socket, msg.requestId, msg.user, callbackFactories[callbackFactoriesKey](msg), outputAuthorizer));
        }

        if (!Object.keys(callbackFactories).every((eventName) => routeMappings.map(routeMapping => routeMapping.eventName).includes(eventName) )) {
            ml.error({ routeMappings, callbackFactories: Object.keys(callbackFactories) }, "There are event listeners without route mappings!");
        }
        if (!routeMappings.map(routeMapping => routeMapping.eventName).every((eventName) => Object.keys(callbackFactories).includes(eventName) )) {
            ml.error({ routeMappings, callbackFactories: Object.keys(callbackFactories) }, "There are route mappings without listeners!");
        }

        socket.on("error", (error) => {
            ml.error(`Socket error: ${String(error)}, emitting an error response`);
            const socketError = error as SocketError;
            const payload = {
                status: false,
                data: null,
                error: socketError.message,
                returnCode: 500,
                requestId: socketError.requestId
            } as CmsMessageResponse;
            socket.emit("response", payload);
        });
        socket.on("disconnect", async () => {
            ml.warn("The socket was disconnected, trying to reconnect...");
            try {
                httpServer.close();
                socket.offAny().removeAllListeners().disconnect();
                const serviceSetup = await reannounce(netBundleAnnounce.bind(null, routeMappings));
                httpServer.close();
                httpServer.listen(serviceSetup.port, "127.0.0.1");
            } catch (error) {
                ml.error(`Error while trying to reconnect the socket or launching a new HTTP server: ${String(error)}`);
                return;
            }
        });
    });

    try {
        const serviceSetup = await reannounce(netBundleAnnounce.bind(null, routeMappings));
        httpServer.listen(serviceSetup.port, "127.0.0.1");
    } catch (error) {
        ml.error(`Error while announcing the service or launching the HTTP server: ${String(error)}`);
        process.exit();
    }
})().then().catch((error) => {
    console.error(`Error while initializing the netBundle service ${String(error)}`);
    process.exit();
});