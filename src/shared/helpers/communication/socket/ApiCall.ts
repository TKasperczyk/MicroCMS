"use strict";

import { Socket } from "socket.io";

import { CmsMessageResponse, LooseObject, ApiResultType } from "@cmsTypes/index";

class ApiCall <ReturnType> {
    public async performStandard(
        socket: Socket, id: string, user: LooseObject,
        crudFunction: () => Promise<ApiResultType<ReturnType>>, outputAuthorizer: (response: ApiResultType<ReturnType>, user: LooseObject) => ApiResultType<ReturnType>
    ): Promise<ApiResultType<ReturnType> | null> {
        return new Promise((resolve) => {
            crudFunction()
                .then((result: ApiResultType<ReturnType>) => {
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