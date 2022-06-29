import { Logger, LoggerOptions } from "pino";
import { Socket } from "socket.io";

import { ApiResult } from "@framework/types/communication";
import { CmsMessageResponse } from "@framework/types/communication/socket";
import { LooseObject } from "@framework/types/generic";

import { Authorizer } from "../Authorizer";

type AuthorizerType = InstanceType<typeof Authorizer>["authorizeOutput"];

export abstract class ApiCall <ReturnType> {
    constructor(socket: Socket, outputAuthorizer: AuthorizerType, rl: Logger<LoggerOptions>) {
        this.socket = socket;
        this.outputAuthorizer = outputAuthorizer;
        this.rl = rl;
    }

    protected socket: Socket;
    protected outputAuthorizer: AuthorizerType;
    protected rl: Logger<LoggerOptions>;

    protected abstract prePerform(requestId: string, user: LooseObject): void;
    protected abstract postPerform(requestId: string, user: LooseObject, result: ApiResult<ReturnType> | null, error: Error | null): void;

    //Resolves to null when it catches an error
    public async performStandard(
        requestId: string, user: LooseObject,
        apiFunction: () => Promise<ApiResult<ReturnType>>
    ): Promise<ApiResult<ReturnType> | null> {
        return new Promise((resolve) => {
            this.rl.info({ requestId, user }, "Executing an API call");
            this.prePerform(requestId, user);
            apiFunction()
                .then((result: ApiResult<ReturnType>) => {
                    this.rl.info({ requestId, user, result }, "Successfully executed an API call");
                    this.postPerform(requestId, user, result, null);
                    this.socket.emit("response", {
                        status: true,
                        data: this.outputAuthorizer(result, user),
                        error: "",
                        returnCode: 200,
                        requestId
                    } as CmsMessageResponse);
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