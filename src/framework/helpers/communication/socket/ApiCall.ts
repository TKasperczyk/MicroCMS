"use strict";

import { Socket } from "socket.io";

import { ApiResult } from "@framework/types/communication";
import { CmsMessageResponse } from "@framework/types/communication/socket";
import { LooseObject } from "@framework/types/generic";


class ApiCall <ReturnType> {
    public async performStandard(
        socket: Socket, id: string, user: LooseObject,
        crudFunction: () => Promise<ApiResult<ReturnType>>, outputAuthorizer: (response: ApiResult<ReturnType>, user: LooseObject) => ApiResult<ReturnType>
    ): Promise<ApiResult<ReturnType> | null> {
        return new Promise((resolve) => {
            crudFunction()
                .then((result: ApiResult<ReturnType>) => {
                    socket.emit("response", {
                        status: true,
                        data: outputAuthorizer(result, user),
                        error: "",
                        returnCode: 200,
                        id
                    } as CmsMessageResponse);
                    resolve(result);
                })
                .catch((error: Error) => {
                    socket.emit("response", {
                        status: false,
                        data: null,
                        error: error.message,
                        returnCode: 500,
                        id
                    });
                    resolve(null);
                });
        });
    }
}

export { ApiCall };