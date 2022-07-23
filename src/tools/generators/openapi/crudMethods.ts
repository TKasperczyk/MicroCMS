import { getCrudResponse } from "./getCrudResponse";
import { getIdParameter } from "./getIdParameter";

export const getMethod = (serviceId: string, type: "all" | "single") => {
    if (type === "single") {
        return new Object({
            "tags": [serviceId],
            "operationId": `getSingle_${serviceId}`,
            "summary": `Gets a single ${serviceId} by _id`,
            "parameters": [getIdParameter(serviceId)],
            "responses": getCrudResponse("get", serviceId, `A single ${serviceId}`)
        });
    } else {
        new Object({
            "tags": [serviceId],
            "operationId": `getAll_${serviceId}s`,
            "summary": `Gets all the ${serviceId}s`,
            "responses": getCrudResponse("get", serviceId, `All the ${serviceId}`, "array")
        });
    }
};
export const searchMethod = (serviceId: string) => new Object({
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
    "responses": getCrudResponse("get", serviceId, `A list of ${serviceId}`, "array")
});
export const aggregateMethod = (serviceId: string) => new Object({
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
    "responses": getCrudResponse("get", serviceId, `A list of ${serviceId}`, "array")
});
export const addMethod = (serviceId: string) => new Object({
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
    "responses": getCrudResponse("get", serviceId, `The added ${serviceId}`)
});
export const updateMethod = (serviceId: string) => new Object({
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
});
export const deleteMethod = (serviceId: string) => new Object({
    "tags": [serviceId],
    "operationId": `delete_${serviceId}`,
    "summary": `Delete a single ${serviceId} by _id`,
    "parameters": [getIdParameter(serviceId)],
    "responses": getCrudResponse("get", serviceId, `The deleted ${serviceId}`)
});