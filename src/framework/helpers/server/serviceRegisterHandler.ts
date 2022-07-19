import { Logger, LoggerOptions } from "pino";

import { ReqCache } from "@framework/core/cache";
import { messageResponseHandler } from "@framework/helpers/server/messageResponseHandler";
import { RouterManager } from "src/server/RouterManager";

import { TCmsMessageResponse, TSocketPoolEntry } from "@framework/types/communication/socket";

export const serviceRegisterHandler = (
    ml: Logger<LoggerOptions>, 
    socketPoolEntry: TSocketPoolEntry,
    routerManager: RouterManager,
    reqCache: ReqCache,
): void => {
    socketPoolEntry.socket.on("response", (cmsMessageResponse: TCmsMessageResponse) => {
        messageResponseHandler(cmsMessageResponse, routerManager, reqCache);
    });
    socketPoolEntry.socket.on("fatalError", (error: unknown) => {
        ml.error({ error }, `Received a fatal error from ${socketPoolEntry.serviceId}. There's a hanging request now`);
    });
};