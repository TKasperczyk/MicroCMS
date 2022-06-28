import { Crud } from "@framework/database/mongo";

import { CmsMessage } from "@framework/types/communication/socket";
import { CrudSearchOptions } from "@framework/types/database/mongo";
import { LooseObject } from "@framework/types/generic";
import { CallbackFactories } from "@framework/types/service";

export const getCrudCallbackFactories = <ServiceType>(serviceCrud: Crud<ServiceType>,): CallbackFactories<ServiceType> => {
    return {
        "search": (msg: CmsMessage) => serviceCrud.search.bind(serviceCrud, { ...msg?.parsedQuery as CrudSearchOptions }),
        "aggregate": (msg: CmsMessage) => serviceCrud.aggregate.bind(serviceCrud, msg?.parsedQuery.pipeline as LooseObject[]),
        "get": (msg: CmsMessage) => serviceCrud.get.bind(serviceCrud, msg?.parsedParams?.id as string),
        "add": (msg: CmsMessage) => serviceCrud.add.bind(serviceCrud, msg?.parsedBody?.netBundle as ServiceType),
        "update": (msg: CmsMessage) => serviceCrud.update.bind(serviceCrud, msg?.parsedParams?.id as string, msg?.parsedBody?.netBundle as ServiceType),
        "delete": (msg: CmsMessage) => serviceCrud.delete.bind(serviceCrud, msg?.parsedParams?.id as string)
    };
};