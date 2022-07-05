import { appLogger, reqLogger } from "@framework";
import { Crud } from "@framework/database/mongo";
import { Authorizer } from "@framework/helpers/communication";
import { MessageParser, ApiCall } from "@framework/helpers/communication/socket";
import { getCrudCallbackFactories, announce, reannounce, boilerplate, getIoServer } from "@framework/helpers/service";

import { createAuthorizeMap } from "./factory";
import { getAuthorizeMapTRouteMappings } from "./routes";
import { TAuthorizeMap } from "./type";

const ml = appLogger("authorizeMap");
const rl = reqLogger("authorizeMap");

const authorizeMapTRouteMappings = getAuthorizeMapTRouteMappings("/core/authorizeMap");
const authorizeMapCrud = new Crud("test", "core.authorizeMap", TAuthorizeMap, createAuthorizeMap, [], []);
const { io, httpServer } = getIoServer();

(async () => {
    try {
        await authorizeMapCrud.init();
    } catch (error) {
        ml.error(`Error while initializing the service: ${String(error)}`);
        process.exit();
    }
    const authorizeMapAuthorizer = new Authorizer<TAuthorizeMap>({ user: {}, group: {} }, "authorizeMap");
    const authorizeMapOutputAuthorizer = authorizeMapAuthorizer.authorizeOutput.bind(authorizeMapAuthorizer);
    const authorizeMapAnnounce = announce.bind(null, "/core/authorizeMap", authorizeMapTRouteMappings, ml);

    io.on("connection", (socket) => {
        ml.info("The socket is connected with the main server");
        
        const callbackFactories = getCrudCallbackFactories<TAuthorizeMap>(authorizeMapCrud);
        const authorizeMapApiCall = new ApiCall<TAuthorizeMap>(socket, authorizeMapOutputAuthorizer, rl);
        const messageParser = new MessageParser(rl, "authorizeMap", true);

        boilerplate<TAuthorizeMap>(
            ml, rl, socket, 
            [messageParser.middleware.bind(messageParser), authorizeMapAuthorizer.middleware.bind(authorizeMapAuthorizer)],
            authorizeMapApiCall, authorizeMapAnnounce, authorizeMapTRouteMappings, 
            callbackFactories,
            httpServer
        );
    });

    try {
        const serviceSetup = await reannounce(authorizeMapAnnounce);
        httpServer.listen(serviceSetup.port, "127.0.0.1");
        ml.info(`Listening on port ${serviceSetup.port}`);
    } catch (error) {
        ml.error(`Error while announcing the service or launching the HTTP server: ${String(error)}`);
        process.exit();
    }
})().then().catch((error) => {
    console.error(`Error while initializing the authorizeMap service ${String(error)}`);
    process.exit();
});