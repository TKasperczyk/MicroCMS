import { Logger, LoggerOptions } from "pino";

import { Authorizer } from "@framework/core/communication";
import { Crud } from "@framework/database/mongo";

import { TApiResult, TAuthorizeMap } from "@framework/types/communication";
import { TCmsMessage } from "@framework/types/communication/socket";
import { TCrudSearchOptions } from "@framework/types/database/mongo";
import { TLooseObject } from "@framework/types/generic";
import { TCallbackFactories } from "@framework/types/service";

import { getServiceAuthorizeMap } from "./authorizer";

export const getCrudCallbackFactories = <TServiceType>(serviceCrud: Crud<TServiceType>, serviceId: string): TCallbackFactories<TServiceType> => {
    return {
        "search": (msg: TCmsMessage) => serviceCrud.search.bind(serviceCrud, { ...msg?.parsedQuery as TCrudSearchOptions }),
        "aggregate": (msg: TCmsMessage) => serviceCrud.aggregate.bind(serviceCrud, msg?.parsedQuery.pipeline as TLooseObject[]),
        "get": (msg: TCmsMessage) => serviceCrud.get.bind(serviceCrud, msg?.parsedParams?.id as string),
        "add": (msg: TCmsMessage) => serviceCrud.add.bind(serviceCrud, msg?.parsedBody[serviceId] as TServiceType),
        "update": (msg: TCmsMessage) => serviceCrud.update.bind(serviceCrud, msg?.parsedParams?.id as string, msg?.parsedBody[serviceId] as TServiceType),
        "delete": (msg: TCmsMessage) => serviceCrud.delete.bind(serviceCrud, msg?.parsedParams?.id as string)
    };
};

export const getCoreCallbackFactories = <TServiceType>(serviceAuthorizer: Authorizer<TServiceType>, ml: Logger<LoggerOptions>, serviceId: string): TCallbackFactories<TServiceType> => {
    return {
        "updateAuthorizeMap": () => async (): Promise<TApiResult<TServiceType>> => {
            ml.debug("Replacing the authorize map");
            const authorizeMap = await getServiceAuthorizeMap(serviceId);
            serviceAuthorizer.authorizeMap = TAuthorizeMap.parse(authorizeMap);
            ml.info({ authorizeMap }, "Replaced the authorize map");
            return null;
        }
    };
};