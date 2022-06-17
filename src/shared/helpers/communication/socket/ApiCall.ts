"use strict";

import { Socket } from "socket.io";

import { CmsMessageResponse, LooseObject } from "@cmsTypes/index";

class ApiCall <ReturnType> {
    constructor() {};
    public async performStandard(
        socket: Socket, id: string, user: LooseObject,
        crudFunction: () => any, outputAuthorizer: (response: ReturnType | ReturnType[], user: LooseObject) => ReturnType | ReturnType[]
    ): Promise<ReturnType | null> {
        return new Promise((resolve, reject) => {
            crudFunction()
                .then((result: ReturnType) => {
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
    };
};

export { ApiCall };