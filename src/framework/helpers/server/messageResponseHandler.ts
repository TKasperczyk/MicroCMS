import { reqLogger } from "@framework";
import { RouterManager } from "src/server/RouterManager";

import { CmsMessageResponse } from "@framework/types/communication/socket";

const rl = reqLogger("server");

export const messageResponseHandler = (response: CmsMessageResponse, routerManager: RouterManager): void => {
    rl.info({ response, requestId: response?.requestId }, "Got a response to a request");
    let parsedResponse = response;
    try {
        parsedResponse = CmsMessageResponse.parse(response);
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