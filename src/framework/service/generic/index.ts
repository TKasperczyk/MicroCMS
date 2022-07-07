import { z } from "zod";

import { appLogger, reqLogger } from "@framework";
import { Crud } from "@framework/database/mongo";
import { Authorizer } from "@framework/helpers/communication";
import { MessageParser, ApiCall } from "@framework/helpers/communication/socket";
import { getCrudCallbackFactories, getCoreCallbackFactories, getServiceAuthorizer, announce, reannounce, applyBoilerplate, getIoServer } from "@framework/helpers/service";

import { TCallbackFactories, TRequiredDefaults } from "@framework/types/service";

import { createGenericServiceFactory } from "./factory";
import { getGenericServiceRouteMappings } from "./routes";

export const runGenericService = async <TGenericService>(
    serviceId: string, 
    servicePath: string, 
    serviceValidator: z.ZodType<TGenericService>, 
    serviceRequiredDefaults: TRequiredDefaults,
    serviceIndexes: string[] = [],
    serviceUniqueIndexes: string[] = []
) => {    
    const ml = appLogger(serviceId);
    const rl = reqLogger(serviceId);

    const genericServiceRouteMappings = getGenericServiceRouteMappings(servicePath);
    const genericServiceCrud = new Crud<TGenericService>("test", serviceId, serviceValidator, createGenericServiceFactory<TGenericService>(), serviceRequiredDefaults, serviceIndexes, serviceUniqueIndexes);
    const { io, httpServer } = getIoServer();
    
    let genericServiceAuthorizer: Authorizer<TGenericService>;
    try {
        await genericServiceCrud.init();
        genericServiceAuthorizer = await getServiceAuthorizer<TGenericService>(serviceId);
    } catch (error) {
        ml.error(`Error while initializing the service: ${String(error)}`);
        process.exit();
    }
    const genericServiceOutputAuthorizer = genericServiceAuthorizer.authorizeOutput.bind(genericServiceAuthorizer);
    const genericServiceAnnounce = announce.bind(null, servicePath, genericServiceRouteMappings);

    io.on("connection", (socket) => {
        ml.info("The socket is connected with the main server");
        
        const callbackFactories: TCallbackFactories<TGenericService> = {
            ...getCrudCallbackFactories<TGenericService>(genericServiceCrud, serviceId),
            ...getCoreCallbackFactories<TGenericService>(genericServiceAuthorizer, ml, serviceId)
        };
        const genericServiceApiCall = new ApiCall<TGenericService>(socket, genericServiceOutputAuthorizer, rl);
        const messageParser = new MessageParser(rl, serviceId, true);

        applyBoilerplate<TGenericService>(
            ml, rl, socket, 
            [
                messageParser.middleware.bind(messageParser), 
                genericServiceAuthorizer.middleware.bind(genericServiceAuthorizer)
            ],
            genericServiceApiCall, genericServiceAnnounce, genericServiceRouteMappings, 
            callbackFactories,
            httpServer
        );
    });

    try {
        const serviceSetup = await reannounce(genericServiceAnnounce);
        httpServer.listen(serviceSetup.port, "127.0.0.1");
        ml.info(`Service ${serviceId} listening on port ${serviceSetup.port}`);
    } catch (error) {
        ml.error(`Error while announcing the service or launching the HTTP server: ${String(error)}`);
        process.exit();
    }
};