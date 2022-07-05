import { Authorizer } from "@framework/helpers/communication";

import { TAuthorizeMap } from "@framework/types/communication";
import { TCmsRequestResponse } from "@framework/types/communication/express";

export const getServiceAuthorizeMap = async (serviceName: string): Promise<TAuthorizeMap> => {
    let serviceAuthorizeMap: TAuthorizeMap;
    try {
        const response = await fetch(`http://127.0.0.1:2000/api/core/serviceAuthorizeMap/search?query={"serviceName": "${serviceName}"}`);
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
        throw new Error(`Error while downloading the authorize map: ${String(error)}`);
    }
    return serviceAuthorizeMap;
};

export const getServiceAuthorizer = async <TService>(serviceName: string): Promise<Authorizer<TService>> => 
    new Authorizer<TService>(await getServiceAuthorizeMap(serviceName), serviceName);