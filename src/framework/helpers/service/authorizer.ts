import { Authorizer } from "@framework/core/communication";
import { getErrorMessage } from "@framework/helpers/getErrorMessage";
import { wait } from "@framework/helpers/wait";
import { appLogger } from "@framework/logger";

import { TAuthorizeMap } from "@framework/types/communication";
import { TCmsRequestResponse } from "@framework/types/communication/express";

export const getServiceAuthorizeMap = async (serviceId: string, retryCounter = 0): Promise<TAuthorizeMap> => {
    const ml = appLogger(serviceId);
    let serviceAuthorizeMap: TAuthorizeMap;
    try {
        const url = `http://127.0.0.1:2000/api/core/serviceAuthorizeMap/search?query={"serviceId": "${serviceId}"}`;
        ml.trace(`Fetching the authorize map from: ${url}`);
        const response = await fetch(url);
        const parsedResponse = TCmsRequestResponse.parse(await response.json());
        if (!parsedResponse || !parsedResponse.status) {
            throw new Error("Couldn't parse the authorize map");
        }
        if (!parsedResponse.data || !Array.isArray(parsedResponse.data) || !parsedResponse.data?.length) {
            serviceAuthorizeMap = TAuthorizeMap.parse({});
        } else {
            serviceAuthorizeMap = TAuthorizeMap.parse(parsedResponse.data[0]?.authorizeMap);
        }
    } catch (error) {
        const errorMsg = `Error while downloading the authorize map: ${getErrorMessage(error)}`;
        if (retryCounter < 3) {
            ml.warn(`${errorMsg} Retrying #${retryCounter}`);
            await wait(2000);
            return await getServiceAuthorizeMap(serviceId, ++retryCounter);
        } else {
            throw new Error(errorMsg);
        }
    }
    return serviceAuthorizeMap;
};

export const getServiceAuthorizer = async <TService>(serviceId: string): Promise<Authorizer<TService>> => 
    new Authorizer<TService>(await getServiceAuthorizeMap(serviceId), serviceId);