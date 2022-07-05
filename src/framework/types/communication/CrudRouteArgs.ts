import { TCrudOperations } from "@framework/types/database";

export type TCrudRouteArgs = TCrudOperations<{ reqPartName: string, requiredArgList: string[] }[]>;