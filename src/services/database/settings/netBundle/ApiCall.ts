import { ApiCall } from "@framework/helpers/communication/socket";

import { ApiResult } from "@framework/types/communication";
import { LooseObject } from "@framework/types/generic";

import { NetBundle } from "./type";

export class NetBundleApiCall extends ApiCall<NetBundle> {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    prePerform(requestId: string, user: LooseObject): void { return; }
    postPerform(requestId: string, user: LooseObject, result: ApiResult<NetBundle> | null, error: Error | null): void { return; }
    /* eslint-enable @typescript-eslint/no-unused-vars */
}