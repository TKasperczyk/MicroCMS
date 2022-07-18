import { TCmsRequestResponse, TCmsRequestResponseOutput } from "@framework/types/communication/express";
import { TCmsMessageResponse } from "@framework/types/communication/socket";

export const socketToExpressResponse = (cmsMessageResponse: TCmsMessageResponse): TCmsRequestResponseOutput => {
    let parsedCmsRequestResponse: TCmsRequestResponseOutput;
    try {
        parsedCmsRequestResponse = TCmsRequestResponse.parse({
            error: cmsMessageResponse.error || "",
            data: cmsMessageResponse.data,
            status: cmsMessageResponse.status,
            returnCode: cmsMessageResponse.returnCode || 200
        });
    } catch (error) {
        parsedCmsRequestResponse = {
            error: String(error),
            data: null,
            status: false,
            returnCode: 500,
            fromCache: false
        };
    }
    return parsedCmsRequestResponse;
};