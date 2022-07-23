import { TLooseObject } from "@framework/types/generic";

export const getCrudResponse = (method: string, serviceId: string, description: string, type: "single" | "array" = "single", code = "200"): TLooseObject => {
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
