import express, { Express, json } from "express";

import { appLogger } from "@framework";
import { messageResponseHandler } from "@framework/helpers/server";

import { TSocketPoolEntry, TCmsMessageResponse } from "@framework/types/communication/socket";

import { Discovery } from "./Discovery";
import { RouterManager } from "./RouterManager";

const ml = appLogger("server");

let discovery: Discovery, routerManager: RouterManager, app: Express;
try {
    discovery = new Discovery();
    routerManager = new RouterManager();
    app = express();
} catch (error) {
    ml.error(`Failed to create the core modules: ${String(error)}`);
    process.exit();
}

try {
    discovery.initServer();
} catch (error) {
    ml.error(`Failed to initialize Discovery ${String(error)}`);
    process.exit();
}

app.use(json());
app.use(routerManager.middleware.bind(routerManager));

discovery.on("register", (socketPoolEntry: TSocketPoolEntry) => {
    ml.info(`Adding new express routes for service: ${socketPoolEntry.serviceId}`);
    try {
        routerManager.replace({ [socketPoolEntry.socket.id]: socketPoolEntry } );
    } catch (error) {
        ml.error(`Failed to replace the router for service: ${socketPoolEntry.serviceId}: ${String(error)}`);
        return;
    }
    ml.info(`Created new express routes for service: ${socketPoolEntry.serviceId}`);

    socketPoolEntry.socket.on("response", (response: TCmsMessageResponse) => {
        messageResponseHandler(response, routerManager);
    });
    socketPoolEntry.socket.on("fatalError", (error: unknown) => {
        ml.error({ error }, `Received a fatal error from ${socketPoolEntry.serviceId}. There's a hanging request now`);
    });
});

discovery.on("unregister", (serviceId: string) => {
    ml.info(`Removing express routes for service: ${serviceId}`);
    try {
        routerManager.replace(discovery.sockets);
    } catch (error) {
        ml.error(`Failed to replace the router for service: ${serviceId}: ${String(error)}`);
        return;
    }
    ml.info(`Removed express routes for service: ${serviceId}`);
});

ml.info("Listening on 2000");
app.listen(2000, "127.0.0.1");