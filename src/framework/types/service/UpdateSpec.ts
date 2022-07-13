export interface TUpdateSpec {
    type: "array" | "object",
    toCollection: string,
    toField: string,
    idField: string
}