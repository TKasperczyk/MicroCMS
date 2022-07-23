import { Logger, LoggerOptions } from "pino";
import { Socket } from "socket.io";

import { Authorizer } from "@framework/core/communication/Authorizer";
import { getErrorMessage } from "@framework/helpers";
import { extractUserData } from "@framework/helpers/communication";
import { TGeneric_Data_User } from "@services/database/generic/data/user/type";

import { TApiResult } from "@framework/types/communication";
import { TCmsMessageResponse } from "@framework/types/communication/socket";

type AuthorizerType = InstanceType<typeof Authorizer>["authorizeOutput"];

export class ApiCall <TReturn> {
    constructor(socket: Socket, outputAuthorizer: AuthorizerType, rl: Logger<LoggerOptions>) {
        this.socket = socket;
        this.outputAuthorizer = outputAuthorizer;
        this.rl = rl;
    }

    protected socket: Socket;
    protected outputAuthorizer: AuthorizerType;
    protected rl: Logger<LoggerOptions>;

    /* eslint-disable @typescript-eslint/no-unused-vars */
    protected prePerform(requestId: string, user: TGeneric_Data_User): void { return; }
    protected postPerform(requestId: string, user: TGeneric_Data_User, result: TApiResult<TReturn> | null, error: Error | null): void { return; }
    /* eslint-enable @typescript-eslint/no-unused-vars */

    //Resolves to null when it catches an error
    public async performStandard(
        requestId: string, cacheId: string | undefined, user: TGeneric_Data_User,
        apiFunction: () => Promise<TApiResult<TReturn>>
    ): Promise<TApiResult<TReturn> | null> {
        const userToLog = extractUserData(user);
        return new Promise((resolve) => {
            this.rl.info({ requestId, userToLog }, "Executing an API call");
            this.prePerform(requestId, user);
            apiFunction()
                .then((result: TApiResult<TReturn>) => {
                    this.rl.info({ requestId, user: userToLog, result }, "Successfully executed an API call");
                    this.postPerform(requestId, user, result, null);
                    this.socket.emit("response", TCmsMessageResponse.parse({
                        status: true,
                        data: this.outputAuthorizer(result, user, requestId),
                        error: "",
                        returnCode: 200,
                        requestId,
                        cacheId
                    }));
                    resolve(result);
                })
                .catch((error: Error) => {
                    this.rl.error({ requestId, userToLog }, `Failed to execute an API call: ${getErrorMessage(error)}`);
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