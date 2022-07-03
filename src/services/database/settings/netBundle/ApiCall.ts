import { ApiCall } from "@framework/helpers/communication/socket";

import { TApiResult } from "@framework/types/communication";
import { TLooseObject } from "@framework/types/generic";

import { NetBundle } from "./type";

export class NetBundleApiCall extends ApiCall<NetBundle> {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    prePerform(requestId: string, user: TLooseObject): void { return; }
    postPerform(requestId: string, user: TLooseObject, result: TApiResult<NetBundle> | null, error: Error | null): void { return; }
    /* eslint-enable @typescript-eslint/no-unused-vars */
}