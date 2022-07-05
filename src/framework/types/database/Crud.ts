/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TCrudOperations<TOperation> {
    get: TOperation,
    search: TOperation,
    aggregate: TOperation,
    add: TOperation,
    update: TOperation,
    delete: TOperation
}
/* eslint-enable @typescript-eslint/no-explicit-any */