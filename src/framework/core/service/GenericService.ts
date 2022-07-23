import { Server as HttpServer } from "node:http";

import * as dotObj from "dot-object";
import { Logger, LoggerOptions } from "pino";
import { Server as IoServer } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { z } from "zod";

import { Authorizer } from "@framework/core/communication";
import { ApiCall, MessageParser } from "@framework/core/communication/socket";
import { Crud } from "@framework/database/mongo";
import { getErrorMessage } from "@framework/helpers";
import { getCrudRouteMappings, getCoreRouteMappings } from "@framework/helpers/communication/socket";
import { getCrudCallbackFactories, getCoreCallbackFactories, getServiceAuthorizer, announce, reannounce, applyBoilerplate, getIoServer } from "@framework/helpers/service";
import { appLogger, reqLogger } from "@framework/logger";

import { TRouteMapping } from "@framework/types/communication/socket";
import { TLooseObject } from "@framework/types/generic";
import { TGenericSpec, TGenericFactory, TRequiredDefaults, TCallbackFactories, TSetupObject } from "@framework/types/service";

export class GenericService<TGenericService> {
    constructor({ 
        serviceId, servicePath, 
        serviceValidator, 
        serviceRequiredDefaults = {}, serviceUpdateSpecs = [], 
        serviceIndexes = [] }: TGenericSpec<TGenericService>
    ) {
        this.serviceId = serviceId;
        this.servicePath = servicePath;

        this.running = false;
        this.shouldStop = false;
        this.ml = appLogger(serviceId);
        this.rl = reqLogger(serviceId);
        this.serviceRouteMappings = this.getServiceRouteMappings(this.servicePath);
        this.serviceCrud = new Crud<TGenericService>(
            "test", serviceId, 
            serviceValidator, this.createServiceFactory<TGenericService>(), 
            serviceRequiredDefaults, serviceUpdateSpecs, 
            serviceIndexes
        );
        this.serviceMessageParser = new MessageParser(this.rl, serviceId, true);
        this.serviceAnnouncer = announce.bind(null, this.serviceId, this.serviceRouteMappings);
        this.serviceAuthorizer = new Authorizer<TGenericService>({}, this.serviceId);
        this.httpServer = new HttpServer();
    }
    
    private serviceId: string;
    private servicePath: string;
    
    private ml: Logger<LoggerOptions>;
    private rl: Logger<LoggerOptions>;
    private serviceRouteMappings: TRouteMapping[];
    private serviceCrud: Crud<TGenericService>;
    private serviceAuthorizer: Authorizer<TGenericService>;
    private serviceMessageParser: MessageParser;
    private serviceAnnouncer: (...args: unknown[]) => Promise<TSetupObject>;
    private httpServer: HttpServer;

    private running: boolean;
    private shouldStop: boolean;

    public async run(): Promise<boolean> {
        this.running = false;
        const { io, httpServer } = getIoServer();
        this.httpServer = httpServer;
        this.ml.info("Initializing the service");

        if (!await this.init()) {
            return false;
        }
    
        this.createSocketListeners(io, httpServer);

        try {
            this.ml.debug("Announcing the service and waiting for a response...");
            const serviceSetup = await reannounce(this.serviceAnnouncer, () => this.shouldStop);
            if (!serviceSetup) {
                throw new Error("Couldn't announce the service!");
            }
            httpServer.listen(serviceSetup.port, "127.0.0.1");
            this.ml.info(`Service ${this.serviceId} listening on port ${serviceSetup.port}`);
        } catch (error) {
            this.ml.error(`Error while announcing the service or launching the HTTP server: ${getErrorMessage(error)}`);
            process.exit();
        }
        this.running = true;
        return true;
    }
    public stop(): void {
        if (!this.running) {
            return;
        }
        this.shouldStop = true;
        try {
            this.httpServer.close();
        } catch (error) {
            this.ml.error(`Error while shutting down the service: ${getErrorMessage(error)}`);
        }
        this.running = false;
        this.shouldStop = false;
    }
    public getServiceRouteMappings(routePrefix: string): TRouteMapping[] {
        return getCoreRouteMappings(routePrefix).concat(getCrudRouteMappings(routePrefix));
    }
    public readonly createServiceFactory = 
    <TGenericService>(): TGenericFactory<TGenericService> => <TGenericServiceSchema extends z.ZodType<TGenericService>>(
        genericService: TGenericService, 
        genericServiceValidator: TGenericServiceSchema,
        requiredDefaults: TRequiredDefaults = {}, 
        includeRequired = false
    ): TGenericService => {
        if (includeRequired) {
            const dottedGenericService = dotObj.dot(genericService) as TLooseObject;
            for (const key of Object.keys(requiredDefaults)) {
                if (!dottedGenericService[key]) {
                    dottedGenericService[key] = requiredDefaults[key];
                }
            }
            genericService = dotObj.object(dottedGenericService) as unknown as TGenericService;
        }
        return genericServiceValidator.parse(genericService);
    };

    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    private createSocketListeners(io: IoServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, httpServer: HttpServer) {
        io.on("connection", (socket) => {
            this.ml.info("The socket is connected with the main server");
            
            const callbackFactories: TCallbackFactories<TGenericService> = {
                ...getCrudCallbackFactories<TGenericService>(this.serviceCrud, this.serviceId),
                ...getCoreCallbackFactories<TGenericService>(this.serviceAuthorizer, this.ml, this.serviceId)
            };
            const serviceApiCall = new ApiCall<TGenericService>(
                socket,
                this.serviceAuthorizer.authorizeOutput.bind(this.serviceAuthorizer), 
                this.rl
            );
    
            applyBoilerplate<TGenericService>(
                this.ml, this.rl, socket, 
                [
                    this.serviceMessageParser.middleware.bind(this.serviceMessageParser), 
                    this.serviceAuthorizer.middleware.bind(this.serviceAuthorizer)
                ],
                serviceApiCall, this.serviceAnnouncer, this.serviceRouteMappings, 
                callbackFactories,
                httpServer,
                () => this.shouldStop,
            );
        });
    }
    private async init(): Promise<boolean> {
        try {
            this.ml.trace("Initializing database CRUD...");
            await this.serviceCrud.init();
            this.ml.trace("Downloading the authorization map...");
            this.serviceAuthorizer = await getServiceAuthorizer<TGenericService>(this.serviceId);
        } catch (error) {
            this.ml.error(`Error while initializing the service: ${getErrorMessage(error)}`);
            return false;
        }
        return true;
    }
}