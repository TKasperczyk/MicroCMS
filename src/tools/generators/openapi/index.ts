import { generateSchema } from "@anatine/zod-openapi";
import { command } from "yargs";

import { GenericService } from "@framework/core/service";
import { getServicePaths } from "@framework/helpers/fileSystem";

import { TLooseObject } from "@framework/types/generic";
import { TGenericSpec } from "@framework/types/service";

import * as crudMethods from "./crudMethods";

process.env.startGenericServices === "false";

const argv = command("generic", "A single generic service to generate").parseSync();

const openApiJson = {
    "openapi": "3.0.0",
    "info": {
        "version": "0.1",
        "title": "MicroCMS",
        "license": {
            "name": "MIT"
        }
    },
    "servers": [
        {
            "url": "localhost:2000"
        }
    ],
    "paths": {} as TLooseObject,
    "components": {
        "schemas": {} as TLooseObject
    }
};

(async () => {
    let databasePaths = await getServicePaths("dist/services/database/generic");
    if (typeof argv.generic === "string") {
        databasePaths = databasePaths.filter(path => path.includes(String(argv.generic)));
    }

    for (const serviceIndexPath of databasePaths) {
        const service = require(serviceIndexPath) as { serviceType: unknown, serviceSpec: TGenericSpec<unknown>, serviceInstance: GenericService<unknown> } //eslint-disable-line

        const { serviceId, servicePath } = service.serviceSpec;
        const schema = generateSchema(service.serviceSpec.serviceValidator);

        const pathCrudMap = [{
            path: `/api${servicePath}/`,
            methods: [
                { expressMethod: "get", crudMethod: crudMethods.getMethod.bind(null, serviceId, "all") },
                { expressMethod: "post", crudMethod: crudMethods.addMethod.bind(null, serviceId) }
            ],
            summary: `Represents a collection of ${serviceId}`,
            description: `This resource represents a collection of ${serviceId} in the system. Should be used for operations that don't require identifying a single ${serviceId}`
        }, {
            path: `/api${servicePath}/{_id}`,
            methods: [
                { expressMethod: "get", crudMethod: crudMethods.getMethod.bind(null, serviceId, "single") },
                { expressMethod: "put", crudMethod: crudMethods.updateMethod.bind(null, serviceId) },
                { expressMethod: "delete", crudMethod: crudMethods.deleteMethod.bind(null, serviceId) },
            ],
            summary: `Represents a ${serviceId}`,
            description: `This resource represents an individual ${serviceId} in the system. Each user is identified by a BSON "_id"`
        }, {
            path: `/api${servicePath}/search`,
            methods: [
                { expressMethod: "get", crudMethod: crudMethods.searchMethod.bind(null, serviceId) },
            ],
            summary: `Represents a search operation of ${serviceId}`,
            description: `This resource is used to search for ${serviceId} based on the provided query`
        }, {
            path: `/api${servicePath}/aggregate`,
            methods: [
                { expressMethod: "get", crudMethod: crudMethods.aggregateMethod.bind(null, serviceId) },
            ],
            summary: `Represents an aggregate operation of ${serviceId}`,
            description: `This resource is used for creating aggregation pipelines for ${serviceId}. Helpful for transforming the results in the backend`
        }];

        pathCrudMap.forEach((mapEntry) => {
            openApiJson.paths[mapEntry.path] = { summary: mapEntry.summary, description: mapEntry.description };
            mapEntry.methods.forEach((method) => {
                openApiJson.paths[mapEntry.path] = { ...openApiJson.paths[mapEntry.path], [method.expressMethod]: method.crudMethod() } as TLooseObject;
            });
        });

        openApiJson.components.schemas[serviceId] = JSON.parse(JSON.stringify(schema).replace(/[,]{0,1}"required":\[\]/g, "")) as TLooseObject;
    }

    console.log(JSON.stringify(openApiJson, null, 4));
    
})().then().catch((error) => {
    console.error(error);
    process.exit();
});
