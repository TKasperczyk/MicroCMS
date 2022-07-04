import { appLogger, reqLogger } from "@framework";
import { Crud } from "@framework/database/mongo";
import { MessageParser, ApiCall } from "@framework/helpers/communication/socket";
import { getCrudCallbackFactories, announce, reannounce, boilerplate, getIoServer } from "@framework/helpers/service";

import { getNetBundleAuthorizer, NetBundleAuthorizer } from "./authorizer";
import { createNetBundle } from "./factory";
import { getNetBundleTRouteMappings } from "./routes";
import { TNetBundle } from "./type";

const ml = appLogger("netBundle");
const rl = reqLogger("netBundle");

const netBundleTRouteMappings = getNetBundleTRouteMappings("/settings/netBundle");
const netBundleCrud = new Crud("test", "settings.netBundle", TNetBundle, createNetBundle, [], ["name"]);
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
        
        const callbackFactories = getCrudCallbackFactories<TNetBundle>(netBundleCrud);
        const netBundleApiCall = new ApiCall<TNetBundle>(socket, netBundleOutputAuthorizer, rl);
        const messageParser = new MessageParser(rl, "netBundle", true);

        boilerplate<TNetBundle>(
            ml, rl, socket, 
            [messageParser.middleware.bind(messageParser), netBundleAuthorizer.middleware.bind(netBundleAuthorizer)],
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