import { parentPort } from "node:worker_threads";

import express, { Express, json } from "express";
import helmet from "helmet";
import nocache from "nocache";

import { appLogger } from "@framework";
//import { ReqParser } from "@framework/core/communication/express";
import { ReqCache } from "@framework/core/cache";
import { getErrorMessage } from "@framework/helpers";
import { addRequestId, addCacheId } from "@framework/helpers/communication/express/middleware";
import { serviceRegisterHandler } from "@framework/helpers/server";

import { TCmsRequest } from "@framework/types/communication/express";
import { TSocketPoolEntry } from "@framework/types/communication/socket";

import { Discovery } from "./Discovery";
import { RouterManager } from "./RouterManager";

const ml = appLogger("server");
//const reqParser = new ReqParser();

let discovery: Discovery, routerManager: RouterManager, app: Express;
try {
    discovery = new Discovery();
    routerManager = new RouterManager((serviceId: string): TSocketPoolEntry | null => {
        const socketPoolEntry = discovery.sockets[serviceId];
        if (!socketPoolEntry) {
            return null;
        }
        return socketPoolEntry;
    });
    app = express();
} catch (error) {
    ml.error(`Failed to create the core modules: ${getErrorMessage(error)}`);
    process.exit();
}

const reqCache = new ReqCache(routerManager);
routerManager.customMiddlewareList.push(addCacheId, reqCache.middleware.bind(reqCache));

try {
    discovery.initServer();
} catch (error) {
    ml.error(`Failed to initialize Discovery ${getErrorMessage(error)}`);
    process.exit();
}

app.use(helmet());
app.use(nocache());
app.use(json());
app.use((req, res, next) => {
    const cmsRequest = req as TCmsRequest;
    const login = Math.random() > 0.5 ? "test" : "test1";
    cmsRequest.user = cmsRequest.user ? cmsRequest.user : {
        login,
        group: login === "test" ? "testGroup" : "testGroup1",
    };
    next();
});
app.use(addRequestId);
app.use(routerManager.middleware.bind(routerManager));

discovery.on("register", (serviceId: string) => {
    ml.info(`Adding new express routes for service: ${serviceId}`);
    try {
        serviceRegisterHandler(ml, serviceId, routerManager, reqCache, discovery);
        routerManager.addServiceRoutes(serviceId);
    } catch (error) {
        ml.error(`Failed to register a new service: ${serviceId}: ${getErrorMessage(error)}`);
        return;
    }
    ml.info(`Created new express routes for service: ${serviceId}`);
});

discovery.on("unregister", (serviceId: string) => {
    ml.info(`Removing express routes for service: ${serviceId}`);
    try {
        routerManager.removeServiceRoutes(serviceId);
    } catch (error) {
        ml.error(`Failed to remove routes of service: ${serviceId}: ${getErrorMessage(error)}`);
        return;
    }
    ml.info(`Removed express routes for service: ${serviceId}`);
});

ml.info("Listening on 2000");
app.listen(2000, "127.0.0.1");

parentPort?.postMessage("initialized");