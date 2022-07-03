import { appLogger, reqLogger } from "@framework";
import { getCrudCallbackFactories, announce, reannounce, boilerplate, getIoServer } from "@framework/helpers/service";

import { NetBundleApiCall } from "./ApiCall";
import { getNetBundleAuthorizer, NetBundleAuthorizer } from "./authorizer";
import { netBundleCrud } from "./crud";
import { NetBundleMessageParser } from "./MessageParser";
import { getNetBundleTRouteMappings } from "./router";
import { NetBundle } from "./type";

const ml = appLogger("netBundle");
const rl = reqLogger("netBundle");

const netBundleTRouteMappings = getNetBundleTRouteMappings("/settings/netBundle");
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
    const netBundleAnnounce = announce.bind(null, "/settings/netBundle", netBundleTRouteMappings, ml);

    io.on("connection", (socket) => {
        ml.info("The socket is connected with the main server");
        
        const callbackFactories = getCrudCallbackFactories<NetBundle>(netBundleCrud);
        const netBundleApiCall = new NetBundleApiCall(socket, netBundleOutputAuthorizer, rl);
        const netBundleMessageParser = new NetBundleMessageParser(rl, "netBundle", true);

        boilerplate<NetBundle>(
            ml, rl, socket, 
            [netBundleMessageParser.middleware.bind(netBundleMessageParser), netBundleAuthorizer.middleware.bind(netBundleAuthorizer)],
            netBundleApiCall, netBundleAnnounce, netBundleTRouteMappings, 
            callbackFactories,
            httpServer
        );
    });

    try {
        const serviceSetup = await reannounce(netBundleAnnounce);
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