import { TCrudOperations } from "@framework/types/database/Crud";

export type TCrudRouteArgs = TCrudOperations<{ reqPartName: string, requiredArgList: string[] }[]>;