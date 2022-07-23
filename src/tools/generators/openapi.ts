import { generateSchema } from "@anatine/zod-openapi";
import { command } from "yargs";

import { GenericService } from "@framework/core/service";
import { getServicePaths } from "@framework/helpers/fileSystem";

import { TLooseObject } from "@framework/types/generic";
import { TGenericSpec } from "@framework/types/service";

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

const getCrudResponse = (method: string, serviceId: string, description: string, type: "single" | "array" = "single", code = "200"): TLooseObject => {
    return {
        [code]: {
            "description": description,
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "status": {
                                "type": "boolean"
                            },
                            "error": {
                                "type": "string"
                            },
                            "data": type === "single" ? {
                                "$ref": `#/components/schemas/${serviceId}`
                            } : {
                                "type": "array",
                                "items": {
                                    "$ref": `#/components/schemas/${serviceId}`
                                }
                            }
                        }
                    }
                }
            }
        }
    };
};

const getIdParameter = (serviceId: string): TLooseObject => {
    return {
        "name": "_id",
        "in": "path",
        "description": `the BSON _id of ${serviceId}`,
        "required": true,
        "schema": {
            "type": "string",
            "example": "5b6a8639bba6847c81f585f4",
            "default": ""
        }
    };
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

        openApiJson.paths[`/api${servicePath}/`] = {
            "summary": `Represents a collection of ${serviceId}`,
            "description": `This resource represents a collection of ${serviceId} in the system. Should be used for operations that don't require identifying a single ${serviceId}`
        };
        openApiJson.paths[`/api${servicePath}/{_id}`] = {
            "summary": `Represents a ${serviceId}`,
            "description": `This resource represents an individual ${serviceId} in the system. Each user is identified by a BSON "_id"`
        };
        openApiJson.paths[`/api${servicePath}/search`] = {
            "summary": `Represents a search operation of ${serviceId}`,
            "description": `This resource is used to search for ${serviceId} based on the provided query`
        };
        openApiJson.paths[`/api${servicePath}/aggregate`] = {
            "summary": `Represents an aggregate operation of ${serviceId}`,
            "description": `This resource is used for creating aggregation pipelines for ${serviceId}. Helpful for transforming the results in the backend`
        };

        ["get", "post", "put", "delete"].forEach((expressMethod) => {
            if (expressMethod === "get") {
                openApiJson.paths[`/api${servicePath}/{_id}`] = {
                    ...openApiJson.paths[`/api${servicePath}/{_id}`],
                    [expressMethod]: {
                        "tags": [serviceId],
                        "operationId": `getSingle_${serviceId}`,
                        "summary": `Gets a single ${serviceId} by _id`,
                        "parameters": [getIdParameter(serviceId)],
                        "responses": getCrudResponse("get", serviceId, `A single ${serviceId}`), 
                    }
                } as TLooseObject;
                openApiJson.paths[`/api${servicePath}/`] = {
                    ...openApiJson.paths[`/api${servicePath}/`],
                    [expressMethod]: {
                        "tags": [serviceId],
                        "operationId": `getAll_${serviceId}s`,
                        "summary": `Gets all the ${serviceId}s`,
                        "responses": getCrudResponse("get", serviceId, `All the ${serviceId}`, "array"), 
                    }
                } as TLooseObject;
                openApiJson.paths[`/api${servicePath}/search`] = {
                    ...openApiJson.paths[`/api${servicePath}/search`],
                    [expressMethod]: {
                        "tags": [serviceId],
                        "operationId": `search_${serviceId}s`,
                        "summary": `Search for ${serviceId}s`,
                        "parameters": [{
                            "name": "query",
                            "in": "query",
                            "description": "The query to search for",
                            "required": true,
                            "schema": {
                                "type": "string",
                                "example": "{\"login\": \"tkasperczyk\"}",
                                "default": "{}"
                            }
                        }, {
                            "name": "sort",
                            "in": "query",
                            "description": "Whether to sort",
                            "required": false,
                            "schema": {
                                "type": "boolean"
                            }
                        }, {
                            "name": "limit",
                            "in": "query",
                            "description": "The maximum number of results",
                            "required": false,
                            "schema": {
                                "type": "number",
                                "minimum": 0,
                                "maximum": 1,
                                "example": 1,
                                "default": 0
                            }
                        }, {
                            "name": "page",
                            "in": "query",
                            "description": "Which page of the results",
                            "required": false,
                            "schema": {
                                "type": "number",
                                "example": 1,
                                "default": 0
                            }
                        }, {
                            "name": "pageSize",
                            "in": "query",
                            "description": "How big each page of the results should be",
                            "required": false,
                            "schema": {
                                "type": "number",
                                "example": 1,
                                "default": 0
                            }
                        }],
                        "responses": getCrudResponse("get", serviceId, `A list of ${serviceId}`, "array"), 
                    }
                } as TLooseObject;
                openApiJson.paths[`/api${servicePath}/aggregate`] = {
                    ...openApiJson.paths[`/api${servicePath}/aggregate`],
                    [expressMethod]: {
                        "tags": [serviceId],
                        "operationId": `aggregate_${serviceId}s`,
                        "summary": `Aggregate multiple ${serviceId}s`,
                        "parameters": [{
                            "name": "pipeline",
                            "in": "query",
                            "description": "The aggregation pipeline",
                            "required": true,
                            "schema": {
                                "type": "string",
                                "example": "[{\"$project\": {\"mainName\": \"$name\"} }]",
                                "default": ""
                            }
                        }],
                        "responses": getCrudResponse("get", serviceId, `A list of ${serviceId}`, "array"), 
                    }
                } as TLooseObject;
            } else if (expressMethod === "post") {
                openApiJson.paths[`/api${servicePath}/`] = {
                    ...openApiJson.paths[`/api${servicePath}/`],
                    [expressMethod]: {
                        "tags": [serviceId],
                        "operationId": `add_${serviceId}`,
                        "summary": `Add a single ${serviceId}`,
                        "requestBody": {
                            "required": true,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            [serviceId]: {
                                                "$ref": `#/components/schemas/${serviceId}`
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "responses": getCrudResponse("get", serviceId, `The added ${serviceId}`), 
                    }
                } as TLooseObject;
            } else if (expressMethod === "put") {
                openApiJson.paths[`/api${servicePath}/{_id}`] = {
                    ...openApiJson.paths[`/api${servicePath}/{_id}`],
                    [expressMethod]: {
                        "tags": [serviceId],
                        "operationId": `update_${serviceId}`,
                        "summary": `Update a single ${serviceId} by _id`,
                        "parameters": [getIdParameter(serviceId)],
                        "requestBody": {
                            "required": true,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            [serviceId]: {
                                                "$ref": `#/components/schemas/${serviceId}`
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "responses": getCrudResponse("get", serviceId, `The updated ${serviceId}`), 
                    }
                } as TLooseObject;
            } else if (expressMethod === "delete") {
                openApiJson.paths[`/api${servicePath}/{_id}`] = {
                    ...openApiJson.paths[`/api${servicePath}/{_id}`],
                    [expressMethod]: {
                        "tags": [serviceId],
                        "operationId": `delete_${serviceId}`,
                        "summary": `Delete a single ${serviceId} by _id`,
                        "parameters": [getIdParameter(serviceId)],
                        "responses": getCrudResponse("get", serviceId, `The deleted ${serviceId}`), 
                    }
                } as TLooseObject;
            }
        });
        openApiJson.components.schemas[serviceId] = JSON.parse(JSON.stringify(schema).replace(/[,]{0,1}"required":\[\]/g, "")) as TLooseObject;
    }
    console.log(JSON.stringify(openApiJson, null, 4));
    
})().then().catch((error) => {
    console.error(error);
    process.exit();
});
