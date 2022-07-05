import { appLogger, reqLogger } from "@framework";
import { Crud } from "@framework/database/mongo";
import { MessageParser, ApiCall } from "@framework/helpers/communication/socket";
import { getCrudCallbackFactories, announce, reannounce, applyBoilerplate, getIoServer } from "@framework/helpers/service";

import { getServiceAuthorizeMapAuthorizer, ServiceAuthorizeMapAuthorizer } from "./authorizer";
import { createServiceAuthorizeMap } from "./factory";
import { getServiceAuthorizeMapTRouteMappings } from "./routes";
import { TServiceAuthorizeMap } from "./type";

const ml = appLogger("serviceAuthorizeMap");
const rl = reqLogger("serviceAuthorizeMap");

const serviceName = "core.serviceAuthorizeMap";
const servicePath = "/core/serviceAuthorizeMap";

const serviceAuthorizeMapTRouteMappings = getServiceAuthorizeMapTRouteMappings(servicePath);
const serviceAuthorizeMapCrud = new Crud("test", serviceName, TServiceAuthorizeMap, createServiceAuthorizeMap, [], ["serviceName"]);
const { io, httpServer } = getIoServer();

(async () => {
    let serviceAuthorizeMapAuthorizer: ServiceAuthorizeMapAuthorizer;
    try {
        await serviceAuthorizeMapCrud.init();
        serviceAuthorizeMapAuthorizer = await getServiceAuthorizeMapAuthorizer();
    } catch (error) {
        ml.error(`Error while initializing the service: ${String(error)}`);
        process.exit();
    }
    const serviceAuthorizeMapOutputAuthorizer = serviceAuthorizeMapAuthorizer.authorizeOutput.bind(serviceAuthorizeMapAuthorizer);
    const serviceAuthorizeMapAnnounce = announce.bind(null, servicePath, serviceAuthorizeMapTRouteMappings, ml);

    io.on("connection", (socket) => {
        ml.info("The socket is connected with the main server");
        
        const callbackFactories = getCrudCallbackFactories<TServiceAuthorizeMap>(serviceAuthorizeMapCrud, serviceName);
        const serviceAuthorizeMapApiCall = new ApiCall<TServiceAuthorizeMap>(socket, serviceAuthorizeMapOutputAuthorizer, rl);
        const messageParser = new MessageParser(rl, serviceName, true);

        applyBoilerplate<TServiceAuthorizeMap>(
            ml, rl, socket, 
            [messageParser.middleware.bind(messageParser), serviceAuthorizeMapAuthorizer.middleware.bind(serviceAuthorizeMapAuthorizer)],
            serviceAuthorizeMapApiCall, serviceAuthorizeMapAnnounce, serviceAuthorizeMapTRouteMappings, 
            callbackFactories,
            httpServer
        );
    });

    try {
        const serviceSetup = await reannounce(serviceAuthorizeMapAnnounce);
        httpServer.listen(serviceSetup.port, "127.0.0.1");
        ml.info(`Listening on port ${serviceSetup.port}`);
    } catch (error) {
        ml.error(`Error while announcing the service or launching the HTTP server: ${String(error)}`);
        process.exit();
    }
})().then().catch((error) => {
    console.error(`Error while initializing the ${serviceName} service ${String(error)}`);
    process.exit();
});