import express, { Express, json } from "express";

import { appLogger } from "@framework";
//import { ReqParser } from "@framework/core/communication/express";
import { ReqCache } from "@framework/core/cache";
import { getErrorMessage } from "@framework/helpers";
import { addRequestId, addCacheId } from "@framework/helpers/communication/express/middleware";
import { messageResponseHandler } from "@framework/helpers/server";

import { TSocketPoolEntry, TCmsMessageResponse } from "@framework/types/communication/socket";

import { Discovery } from "./Discovery";
import { RouterManager } from "./RouterManager";

const ml = appLogger("server");
//const reqParser = new ReqParser();

let discovery: Discovery, routerManager: RouterManager, app: Express;
try {
    discovery = new Discovery();
    routerManager = new RouterManager();
    app = express();
} catch (error) {
    ml.error(`Failed to create the core modules: ${getErrorMessage(error)}`);
    process.exit();
}

try {
    discovery.initServer();
} catch (error) {
    ml.error(`Failed to initialize Discovery ${getErrorMessage(error)}`);
    process.exit();
}

const reqCache = new ReqCache(routerManager.getRequest.bind(routerManager));

app.use(json());
app.use(addRequestId);
app.use(addCacheId);
app.use(reqCache.middleware.bind(reqCache));
app.use(routerManager.middleware.bind(routerManager));

discovery.on("register", (socketPoolEntry: TSocketPoolEntry) => {
    ml.info(`Adding new express routes for service: ${socketPoolEntry.serviceId}`);
    try {
        routerManager.replace(discovery.sockets);
    } catch (error) {
        ml.error(`Failed to replace the router for service: ${socketPoolEntry.serviceId}: ${getErrorMessage(error)}`);
        return;
    }
    ml.info(`Created new express routes for service: ${socketPoolEntry.serviceId}`);

    socketPoolEntry.socket.on("response", (response: TCmsMessageResponse) => {
        reqCache.saveToCache(response).then(() => {
            messageResponseHandler(response, routerManager);
        }).catch((error) => {
            console.error(error);
            messageResponseHandler(response, routerManager);
        });
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
        ml.error(`Failed to replace the router for service: ${serviceId}: ${getErrorMessage(error)}`);
        return;
    }
    ml.info(`Removed express routes for service: ${serviceId}`);
});

ml.info("Listening on 2000");
app.listen(2000, "127.0.0.1");