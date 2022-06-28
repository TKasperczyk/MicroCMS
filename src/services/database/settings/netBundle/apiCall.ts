import { Socket } from "socket.io";

import { ApiCall } from "@framework/helpers/communication/socket";
import { reqLogger } from "@framework/logger";

import { ApiResult } from "@framework/types/communication";
import { LooseObject } from "@framework/types/generic";

import { NetBundle } from "./type";

const rl = reqLogger("netBundle");

export class NetBundleApiCall extends ApiCall<NetBundle> {
    prePerform(socket: Socket, requestId: string, user: LooseObject): void {
        rl.info({ requestId, user }, "Executing an API call");
    }
    postPerform(socket: Socket, requestId: string, user: LooseObject, result: ApiResult<NetBundle> | null, error: Error | null): void {
        if (error === null) {
            rl.info({ requestId, user, result }, "Successfully executed an API call");
        } else {
            rl.error({ requestId, user, result }, `Failed to execute an API call: ${String(error)}`);
        }
    }
}
export const netBundleApiCall = new NetBundleApiCall();