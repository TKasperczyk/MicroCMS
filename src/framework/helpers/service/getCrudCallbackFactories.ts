import { Crud } from "@framework/database/mongo";

import { TCmsMessage } from "@framework/types/communication/socket";
import { TCrudSearchOptions } from "@framework/types/database/mongo";
import { TLooseObject } from "@framework/types/generic";
import { TCallbackFactories } from "@framework/types/service";

export const getCrudCallbackFactories = <TServiceType>(serviceCrud: Crud<TServiceType>,): TCallbackFactories<TServiceType> => {
    return {
        "search": (msg: TCmsMessage) => serviceCrud.search.bind(serviceCrud, { ...msg?.parsedQuery as TCrudSearchOptions }),
        "aggregate": (msg: TCmsMessage) => serviceCrud.aggregate.bind(serviceCrud, msg?.parsedQuery.pipeline as TLooseObject[]),
        "get": (msg: TCmsMessage) => serviceCrud.get.bind(serviceCrud, msg?.parsedParams?.id as string),
        "add": (msg: TCmsMessage) => serviceCrud.add.bind(serviceCrud, msg?.parsedBody?.netBundle as TServiceType),
        "update": (msg: TCmsMessage) => serviceCrud.update.bind(serviceCrud, msg?.parsedParams?.id as string, msg?.parsedBody?.netBundle as TServiceType),
        "delete": (msg: TCmsMessage) => serviceCrud.delete.bind(serviceCrud, msg?.parsedParams?.id as string)
    };
};