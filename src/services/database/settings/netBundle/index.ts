import { appLogger } from "@framework";
import { getCrudCallbackFactories, reannounce, boilerplate, getIoServer } from "@framework/helpers/service";

import { netBundleAnnounce } from "./announce";
import { netBundleApiCall } from "./apiCall";
import { getNetBundleAuthorizer, NetBundleAuthorizer } from "./authorizer";
import { netBundleCrud } from "./crud";
import { netBundleMessageParser } from "./parser";
import { getNetBundleRouteMappings } from "./router";
import { NetBundle } from "./type";

const ml = appLogger("netBundle");

const netBundleRouteMappings = getNetBundleRouteMappings("/settings/netBundle");
const { io, httpServer } = getIoServer();

(async () => {
    let netBundleAuthorizer: NetBundleAuthorizer;
    try {
        await netBundleCrud.init();
        netBundleAuthorizer = await getNetBundleAuthorizer();
    } catch (error) {
        ml.error(`Error while initializing the service: ${String(error)}`);
        process.exit();
    }
    const netBundleOutputAuthorizer = netBundleAuthorizer.authorizeOutput.bind(netBundleAuthorizer);

    io.on("connection", (socket) => {
        ml.info("The socket is connected with the main server");
        socket.use(netBundleMessageParser.middleware.bind(netBundleMessageParser));
        socket.use(netBundleAuthorizer.middleware.bind(netBundleAuthorizer));
        const callbackFactories = getCrudCallbackFactories<NetBundle>(netBundleCrud);
        boilerplate<NetBundle>(
            ml, socket, 
            netBundleApiCall, netBundleAnnounce, netBundleOutputAuthorizer, netBundleRouteMappings, 
            callbackFactories,
            httpServer
        );
    });

    try {
        const serviceSetup = await reannounce(netBundleAnnounce.bind(null, netBundleRouteMappings));
        httpServer.listen(serviceSetup.port, "127.0.0.1");
        ml.info(`Listening on port ${serviceSetup.port}`);
    } catch (error) {
        ml.error(`Error while announcing the service or launching the HTTP server: ${String(error)}`);
        process.exit();
    }
})().then().catch((error) => {
    console.error(`Error while initializing the netBundle service ${String(error)}`);
    process.exit();
});