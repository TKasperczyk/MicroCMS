import { Sort } from "mongodb";

import { LooseObject } from "@framework/types/generic";

export interface CrudSearchOptions {
    query: LooseObject, 
    sort: Sort, 
    page: number,
    pageSize: number, 
    limit: number
}