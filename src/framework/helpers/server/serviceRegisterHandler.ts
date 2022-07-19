import { Logger, LoggerOptions } from "pino";

import { ReqCache } from "@framework/core/cache";
import { messageResponseHandler } from "@framework/helpers/server/messageResponseHandler";
import { Discovery } from "src/server/Discovery";
import { RouterManager } from "src/server/RouterManager";

import { TCmsMessageResponse } from "@framework/types/communication/socket";

export const serviceRegisterHandler = (
    ml: Logger<LoggerOptions>, 
    serviceId: string,
    routerManager: RouterManager,
    reqCache: ReqCache,
    discovery: Discovery
): void => {
    discovery.sockets[serviceId].socket.on("response", (cmsMessageResponse: TCmsMessageResponse) => {
        messageResponseHandler(cmsMessageResponse, routerManager, reqCache);
    });
    discovery.sockets[serviceId].socket.on("fatalError", (error: unknown) => {
        ml.error({ error }, `Received a fatal error from ${serviceId}. There's a hanging request now`);
    });
};