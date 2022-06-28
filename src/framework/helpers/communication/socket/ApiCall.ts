import { Socket } from "socket.io";

import { ApiResult } from "@framework/types/communication";
import { CmsMessageResponse } from "@framework/types/communication/socket";
import { LooseObject } from "@framework/types/generic";

export abstract class ApiCall <ReturnType> {
    protected abstract prePerform(socket: Socket, requestId: string, user: LooseObject): void;
    protected abstract postPerform(socket: Socket, requestId: string, user: LooseObject, result: ApiResult<ReturnType> | null, error: Error | null): void;

    //Resolves to null when it catches an error
    public async performStandard(
        socket: Socket, requestId: string, user: LooseObject,
        crudFunction: () => Promise<ApiResult<ReturnType>>, outputAuthorizer: (response: ApiResult<ReturnType>, user: LooseObject) => ApiResult<ReturnType>
    ): Promise<ApiResult<ReturnType> | null> {
        this.prePerform(socket, requestId, user);
        return new Promise((resolve) => {
            crudFunction()
                .then((result: ApiResult<ReturnType>) => {
                    this.postPerform(socket, requestId, user, result, null);
                    socket.emit("response", {
                        status: true,
                        data: outputAuthorizer(result, user),
                        error: "",
                        returnCode: 200,
                        requestId
                    } as CmsMessageResponse);
                    resolve(result);
                })
                .catch((error: Error) => {
                    this.postPerform(socket, requestId, user, null, error);
                    socket.emit("response", {
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