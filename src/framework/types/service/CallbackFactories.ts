import { ApiResult } from "@framework/types/communication";
import { CmsMessage } from "@framework/types/communication/socket";

export interface CallbackFactories<ReturnType> {
    // We need to allow "any" because the API function can have any number of arguments
    [key: string]: (msg: CmsMessage) => (...args: any) => Promise<ApiResult<ReturnType>> //eslint-disable-line @typescript-eslint/no-explicit-any
}