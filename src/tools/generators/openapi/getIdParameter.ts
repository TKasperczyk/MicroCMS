import { TLooseObject } from "@framework/types/generic";

export const getIdParameter = (serviceId: string): TLooseObject => {
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