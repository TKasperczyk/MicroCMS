import { appLogger, reqLogger } from "@framework";
import { MessageParser, ApiCall } from "@framework/core/communication/socket";
import { Crud } from "@framework/database/mongo";
import { getErrorMessage } from "@framework/helpers";
import { getCrudCallbackFactories, announce, reannounce, applyBoilerplate, getIoServer } from "@framework/helpers/service";

import { getCore_serviceAuthorizeMapAuthorizer, Core_ServiceAuthorizeMapAuthorizer } from "./authorizer";
import { createCore_serviceAuthorizeMap } from "./factory";
import { getCore_serviceAuthorizeMapRouteMappings } from "./routes";
import { TCore_ServiceAuthorizeMap, core_serviceAuthorizerMapRequiredDefaults, core_serviceAuthorizerMapUpdateSpecs } from "./type";

const serviceId = "core.serviceAuthorizeMap";
const servicePath = "/core/serviceAuthorizeMap";

const ml = appLogger(serviceId);
const rl = reqLogger(serviceId);

const core_serviceAuthorizeMapRouteMappings = getCore_serviceAuthorizeMapRouteMappings(servicePath);
const core_serviceAuthorizeMapCrud = new Crud<TCore_ServiceAuthorizeMap>(
    "test", serviceId, 
    TCore_ServiceAuthorizeMap, createCore_serviceAuthorizeMap, 
    core_serviceAuthorizerMapRequiredDefaults, core_serviceAuthorizerMapUpdateSpecs, 
    [], ["serviceId"]
);
const { io, httpServer } = getIoServer();

(async () => {
    let core_serviceAuthorizeMapAuthorizer: Core_ServiceAuthorizeMapAuthorizer;
    try {
        await core_serviceAuthorizeMapCrud.init();
        core_serviceAuthorizeMapAuthorizer = await getCore_serviceAuthorizeMapAuthorizer();
    } catch (error) {
        ml.error(`Error while initializing the service: ${getErrorMessage(error)}`);
        process.exit();
    }
    const core_serviceAuthorizeMapOutputAuthorizer = core_serviceAuthorizeMapAuthorizer.authorizeOutput.bind(core_serviceAuthorizeMapAuthorizer);
    const core_serviceAuthorizeMapAnnounce = announce.bind(null, servicePath, core_serviceAuthorizeMapRouteMappings);

    io.on("connection", (socket) => {
        ml.info("The socket is connected with the main server");
        
        const callbackFactories = getCrudCallbackFactories<TCore_ServiceAuthorizeMap>(core_serviceAuthorizeMapCrud, serviceId);
        const core_serviceAuthorizeMapApiCall = new ApiCall<TCore_ServiceAuthorizeMap>(socket, core_serviceAuthorizeMapOutputAuthorizer, rl);
        const messageParser = new MessageParser(rl, serviceId, true);

        applyBoilerplate<TCore_ServiceAuthorizeMap>(
            ml, rl, socket, 
            [messageParser.middleware.bind(messageParser), core_serviceAuthorizeMapAuthorizer.middleware.bind(core_serviceAuthorizeMapAuthorizer)],
            core_serviceAuthorizeMapApiCall, core_serviceAuthorizeMapAnnounce, core_serviceAuthorizeMapRouteMappings, 
            callbackFactories,
            httpServer
        );
    });

    try {
        const serviceSetup = await reannounce(core_serviceAuthorizeMapAnnounce);
        httpServer.listen(serviceSetup.port, "127.0.0.1");
        ml.info(`Listening on port ${serviceSetup.port}`);
    } catch (error) {
        ml.error(`Error while announcing the service or launching the HTTP server: ${getErrorMessage(error)}`);
        process.exit();
    }
})().then().catch((error) => {
    console.error(`Error while initializing the ${serviceId} service ${getErrorMessage(error)}`);
    process.exit();
});