import { ReqCache } from "@framework/core/cache";
import { socketToExpressResponse } from "@framework/helpers/communication";
import { getErrorMessage } from "@framework/helpers/getErrorMessage";
import { reqLogger } from "@framework/logger";
import { RouterManager } from "src/server/RouterManager";

import { TCmsMessageResponse } from "@framework/types/communication/socket";

const rl = reqLogger("server");

export const messageResponseHandler = (cmsMessageResponse: TCmsMessageResponse, routerManager: RouterManager, reqCache: ReqCache): void => {
    //Parse the incoming message response
    rl.info({ requestId: cmsMessageResponse?.requestId }, "Got a response to a request");
    let parsedCmsMessageResponse = cmsMessageResponse;
    try {
        parsedCmsMessageResponse = TCmsMessageResponse.parse(cmsMessageResponse);
        rl.trace({ response: { ...parsedCmsMessageResponse, data: `${JSON.stringify(parsedCmsMessageResponse.data).substring(0, 10)}...` }, requestId: parsedCmsMessageResponse.requestId }, "Parsed the message response");
    } catch (error) {
        rl.error({ cmsMessageResponse, requestId: cmsMessageResponse?.requestId }, `Failed to parse a response: ${getErrorMessage(error)}`);
        return;
    }

    //Convert the parsed message response to a request response
    const cmsRequestResponse = socketToExpressResponse(parsedCmsMessageResponse);
    if (cmsRequestResponse.returnCode === 500) {
        rl.error({ cmsMessageResponse, requestId: cmsMessageResponse.requestId }, "Failed to respond to a request, passing an error to the client");
    }

    //Don't save errors
    if (cmsRequestResponse.returnCode === 200) {
        reqCache.save(cmsRequestResponse, parsedCmsMessageResponse.requestId);
    }

    try {
        routerManager.respondToRequest(cmsRequestResponse, parsedCmsMessageResponse.requestId);
    } catch (error) {
        rl.error({ parsedCmsMessageResponse, requestId: parsedCmsMessageResponse.requestId }, `Failed to respond to a request: ${getErrorMessage(error)}`);
        return;
    }
};