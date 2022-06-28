import { Server } from "http";

import { Logger, LoggerOptions } from "pino";
import { Socket } from "socket.io";

import { Authorizer } from "@framework/helpers/communication";
import { ApiCall } from "@framework/helpers/communication/socket";
import { addPacketId, shutdown } from "@framework/helpers/communication/socket/middleware";
import { reannounce } from "@framework/helpers/service";

import { CmsMessage, CmsMessageResponse, RouteMapping } from "@framework/types/communication/socket";
import { SocketError } from "@framework/types/errors";
import { SetupObject, CallbackFactories } from "@framework/types/service";

export const boilerplate = <ServiceType>(
    ml: Logger<LoggerOptions>, 
    socket: Socket, 
    serviceApiCall: ApiCall<ServiceType>,
    serviceAnnounce: (routes: RouteMapping[]) => Promise<SetupObject>,
    serviceOutputAuthorizer: InstanceType<typeof Authorizer<ServiceType>>["authorizeOutput"],
    serviceRouteMappings: RouteMapping[],
    callbackFactories: CallbackFactories<ServiceType>,
    httpServer: Server,
): void => {
    // Add common middleware
    socket.use(shutdown);
    socket.use(addPacketId);

    // Launch listeners based on callbackFactories 
    for (const eventName of Object.keys(callbackFactories)) {
        const callbackFactoriesKey = eventName as keyof typeof callbackFactories;
        ml.debug(`Launching a listener for event: ${eventName}`);
        socket.on(eventName, (msg: CmsMessage) => serviceApiCall.performStandard(
            socket, msg.requestId, msg.user, 
            callbackFactories[callbackFactoriesKey](msg), 
            serviceOutputAuthorizer
        ));
    }

    // Check the internal consistency of callbackFactories and serviceRouteMappings - they should correspond to each other
    if (!Object.keys(callbackFactories).every(
        (eventName) => 
            serviceRouteMappings.map(serviceRouteMapping => serviceRouteMapping.eventName).includes(eventName) )
    ) {
        ml.error({ serviceRouteMappings, callbackFactories: Object.keys(callbackFactories) }, "There are event listeners without route mappings!");
    }
    if (!serviceRouteMappings.map(serviceRouteMapping => serviceRouteMapping.eventName).every(
        (eventName) => 
            Object.keys(callbackFactories).includes(eventName) )
    ) {
        ml.error({ serviceRouteMappings, callbackFactories: Object.keys(callbackFactories) }, "There are route mappings without listeners!");
    }

    // Add error handling - all errors thrown by internals will be caught here and passed to the main server
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