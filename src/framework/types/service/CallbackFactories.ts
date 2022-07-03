import { TApiResult } from "@framework/types/communication/ApiResult";
import { TCmsMessage } from "@framework/types/communication/socket/CmsMessage";

export interface TCallbackFactories<TReturn> {
    // We need to allow "any" because the API function can have any number of arguments
    [key: string]: (msg: TCmsMessage) => (...args: any) => Promise<TApiResult<TReturn>> //eslint-disable-line @typescript-eslint/no-explicit-any
}