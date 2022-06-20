export interface AuthorizeMapEntry {
    hiddenReadFields: string[],
    forbiddenWriteFields: string[],
    forbiddenOperations: string[]
}

export interface AuthorizeMap {
    user: {
        [key: string]: AuthorizeMapEntry
    },
    group: {
        [key: string]: AuthorizeMapEntry
    }
}