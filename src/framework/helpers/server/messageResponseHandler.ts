import { reqLogger } from "@framework";
import { RouterManager } from "src/server/RouterManager";

import { TCmsMessageResponse } from "@framework/types/communication/socket";

const rl = reqLogger("server");

export const messageResponseHandler = (response: TCmsMessageResponse, routerManager: RouterManager): void => {
    rl.info({ requestId: response?.requestId }, "Got a response to a request");
    let parsedResponse = response;
    try {
        parsedResponse = TCmsMessageResponse.parse(response);
        rl.debug({ response: { ...response, data: `${JSON.stringify(response.data).substring(0, 10)}...` }, requestId: response.requestId }, "Parsed the response");
    } catch (error) {
        rl.error({ response, requestId: response?.requestId }, `Failed to parse a response: ${String(error)}`);
        return;
    }
    try {
        routerManager.respondToRequest(parsedResponse);
    } catch (error) {
        rl.error({ response, requestId: response.requestId }, `[Failed to respond to a request: ${String(error)}`);
        return;
    }
};