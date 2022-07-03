import { Sort } from "mongodb";

import { TLooseObject } from "@framework/types/generic/Object";

export interface TCrudSearchOptions {
    query: TLooseObject, 
    sort: Sort, 
    page: number,
    pageSize: number, 
    limit: number
}