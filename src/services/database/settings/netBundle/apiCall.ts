import { ApiCall } from "@framework/helpers/communication/socket";

import { NetBundle } from "./type";

export class NetBundleApiCall extends ApiCall<NetBundle> { }
export const netBundleApiCall = new NetBundleApiCall();