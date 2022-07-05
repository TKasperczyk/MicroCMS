import { TCrudOperations } from "@framework/types/database";

export const TCrudOperationsTFactory = (): TCrudOperations<null> => {
    return {
        get: null,
        search: null,
        aggregate: null,
        add: null,
        update: null,
        delete: null
    };
};