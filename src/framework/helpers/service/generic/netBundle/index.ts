import { z } from "zod";

import { appLogger, reqLogger } from "@framework";
import { Crud } from "@framework/database/mongo";
import { Authorizer } from "@framework/helpers/communication";
import { MessageParser, ApiCall } from "@framework/helpers/communication/socket";
import { getCrudCallbackFactories, getCoreCallbackFactories, getServiceAuthorizer, announce, reannounce, applyBoilerplate, getIoServer } from "@framework/helpers/service";

import { TCallbackFactories } from "@framework/types/service";

import { createGenericServiceFactory } from "./factory";
import { getGenericServiceRouteMappings } from "./routes";

export const runGenericService = async <TGenericService, TGenericServiceSchema extends z.ZodType<TGenericService>>(serviceName: string, servicePath: string, serviceValidator: TGenericServiceSchema) => {    
    const ml = appLogger(serviceName);
    const rl = reqLogger(serviceName);

    const genericServiceRouteMappings = getGenericServiceRouteMappings(servicePath);
    const genericServiceCrud = new Crud("test", serviceName, serviceValidator, createGenericServiceFactory<TGenericService>(), [], ["name"]);
    const { io, httpServer } = getIoServer();
    
    let netBundleAuthorizer: Authorizer<TGenericService>;
    try {
        await netBundleCrud.init();
        netBundleAuthorizer = await getServiceAuthorizer<TNetBundle>(serviceName);
    } catch (error) {
        ml.error(`Error while initializing the service: ${String(error)}`);
        process.exit();
    }
    const netBundleOutputAuthorizer = netBundleAuthorizer.authorizeOutput.bind(netBundleAuthorizer);
    const netBundleAnnounce = announce.bind(null, servicePath, netBundleRouteMappings, ml);

    io.on("connection", (socket) => {
        ml.info("The socket is connected with the main server");
        
        const callbackFactories: TCallbackFactories<TNetBundle> = {
            ...getCrudCallbackFactories<TNetBundle>(netBundleCrud, serviceName),
            ...getCoreCallbackFactories<TNetBundle>(netBundleAuthorizer, ml, serviceName)
        };
        const netBundleApiCall = new ApiCall<TNetBundle>(socket, netBundleOutputAuthorizer, rl);
        const messageParser = new MessageParser(rl, serviceName, true);

        applyBoilerplate<TNetBundle>(
            ml, rl, socket, 
            [
                messageParser.middleware.bind(messageParser), 
                netBundleAuthorizer.middleware.bind(netBundleAuthorizer)
            ],
            netBundleApiCall, netBundleAnnounce, netBundleRouteMappings, 
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
};