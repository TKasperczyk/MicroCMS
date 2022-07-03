import { Logger, LoggerOptions } from "pino";
import { Socket } from "socket.io";

import { TApiResult } from "@framework/types/communication";
import { TCmsMessageResponse } from "@framework/types/communication/socket";
import { TLooseObject } from "@framework/types/generic";

import { Authorizer } from "../Authorizer";

type AuthorizerType = InstanceType<typeof Authorizer>["authorizeOutput"];

export abstract class ApiCall <TReturn> {
    constructor(socket: Socket, outputAuthorizer: AuthorizerType, rl: Logger<LoggerOptions>) {
        this.socket = socket;
        this.outputAuthorizer = outputAuthorizer;
        this.rl = rl;
    }

    protected socket: Socket;
    protected outputAuthorizer: AuthorizerType;
    protected rl: Logger<LoggerOptions>;

    protected abstract prePerform(requestId: string, user: TLooseObject): void;
    protected abstract postPerform(requestId: string, user: TLooseObject, result: TApiResult<TReturn> | null, error: Error | null): void;

    //Resolves to null when it catches an error
    public async performStandard(
        requestId: string, user: TLooseObject,
        apiFunction: () => Promise<TApiResult<TReturn>>
    ): Promise<TApiResult<TReturn> | null> {
        return new Promise((resolve) => {
            this.rl.info({ requestId, user }, "Executing an API call");
            this.prePerform(requestId, user);
            apiFunction()
                .then((result: TApiResult<TReturn>) => {
                    this.rl.info({ requestId, user, result }, "Successfully executed an API call");
                    this.postPerform(requestId, user, result, null);
                    this.socket.emit("response", {
                        status: true,
                        data: this.outputAuthorizer(result, user),
                        error: "",
                        returnCode: 200,
                        requestId
                    } as TCmsMessageResponse);
                    resolve(result);
                })
                .catch((error: Error) => {
                    this.rl.error({ requestId, user }, `Failed to execute an API call: ${String(error)}`);
                    this.postPerform(requestId, user, null, error);
                    this.socket.emit("response", {
                        status: false,
                        data: null,
                        error: error.message,
                        returnCode: 500,
                        requestId
                    });
                    resolve(null);
                });
        });
    }
}