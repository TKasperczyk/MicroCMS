import { Server } from "http";

import { Logger, LoggerOptions } from "pino";
import { Socket } from "socket.io";

import { ApiCall } from "@framework/helpers/communication/socket";
import { addPacketId, shutdown } from "@framework/helpers/communication/socket/middleware";
import { reannounce } from "@framework/helpers/service";

import { TCmsMessage, TCmsMessageResponse, TRouteMapping, TSocketMiddleware } from "@framework/types/communication/socket";
import { TSocketError } from "@framework/types/errors";
import { TSetupObject, TCallbackFactories } from "@framework/types/service";

export const applyBoilerplate = <TServiceType>(
    ml: Logger<LoggerOptions>, rl: Logger<LoggerOptions>, 
    socket: Socket, 
    serviceMiddlewares: TSocketMiddleware[],
    serviceApiCall: ApiCall<TServiceType>,
    serviceAnnounce: (routes: TRouteMapping[]) => Promise<TSetupObject>,
    serviceRouteMappings: TRouteMapping[],
    callbackFactories: TCallbackFactories<TServiceType>,
    httpServer: Server,
): void => {
    // Add common middleware
    socket.use(shutdown);
    socket.use(addPacketId);
    serviceMiddlewares.forEach((serviceMiddleware) => {
        socket.use(serviceMiddleware);
    });

    // Launch listeners based on callbackFactories 
    for (const eventName of Object.keys(callbackFactories)) {
        const callbackFactoriesKey = eventName as keyof typeof callbackFactories;
        ml.debug(`Launching a listener for event: ${eventName}`);
        socket.on(eventName, 
            (msg: TCmsMessage) => 
                serviceApiCall.performStandard(
                    msg.requestId, 
                    msg.user, 
                    callbackFactories[callbackFactoriesKey](msg)
                )
        );
    }

    // Check the internal consistency of callbackFactories and serviceRouteMappings - they should correspond to each other
    if (!Object.keys(callbackFactories).every(
        (eventName) => 
            serviceRouteMappings.map(serviceTRouteMapping => serviceTRouteMapping.eventName).includes(eventName) )
    ) {
        ml.error({ serviceRouteMappings, callbackFactories: Object.keys(callbackFactories) }, "There are event listeners without route mappings!");
    }
    if (!serviceRouteMappings.map(serviceTRouteMapping => serviceTRouteMapping.eventName).every(
        (eventName) => 
            Object.keys(callbackFactories).includes(eventName) )
    ) {
        ml.error({ serviceRouteMappings, callbackFactories: Object.keys(callbackFactories) }, "There are route mappings without listeners!");
    }

    // Add error handling - all errors thrown by internals will be caught here and passed to the main server
    socket.on("error", (error) => {
        const socketError = error as TSocketError;
        ml.error(`Socket error: ${String(socketError)}, emitting an error response`);
        rl.error({ requestId: socketError?.requestId || "" }, `Socket error: ${String(socketError)}, emitting an error response`);
        if (socketError instanceof TSocketError && socketError?.requestId) {
            const payload = {
                status: false,
                data: null,
                error: socketError.message,
                returnCode: 500,
                requestId: socketError.requestId
            } as TCmsMessageResponse;
            socket.emit("response", payload);
        } else {
            let payload: string | unknown = error;
            try {
                payload = String(error);
            } catch (error) { } //eslint-disable-line no-empty
            socket.emit("fatalError", payload);
        }
    });
    // Handle disconnections - keep reconnecting 
    socket.on("disconnect", async () => {
        ml.warn("The socket was disconnected, trying to reconnect...");
        try {
            httpServer.close();
            socket.offAny().removeAllListeners().disconnect();
            const serviceSetup = await reannounce(serviceAnnounce.bind(null, serviceRouteMappings));
            httpServer.close();
            httpServer.listen(serviceSetup.port, "127.0.0.1");
        } catch (error) {
            ml.error(`Error while trying to reconnect the socket or launching a new HTTP server: ${String(error)}`);
            return;
        }
    });
};