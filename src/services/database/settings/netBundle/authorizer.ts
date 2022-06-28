import { Authorizer } from "@framework/helpers/communication";

import { AuthorizeMap, ApiResult } from "@framework/types/communication";
import { LooseObject } from "@framework/types/generic";

import { NetBundle } from "./type";

const netBundleAuthorizeMap: AuthorizeMap = {
    user: {
        "test": {
            hiddenReadFields: [],
            forbiddenWriteFields: [],
            forbiddenOperations: []
        }
    },
    group: {
        "testGroup": {
            hiddenReadFields: ["name"],
            forbiddenWriteFields: ["name"],
            forbiddenOperations: []
        }
    }
};

export class NetBundleAuthorizer extends Authorizer<NetBundle> {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    customInputLogic(input: NetBundle): boolean { return true; }
    customOutputLogic(response: ApiResult<NetBundle>, user: LooseObject): ApiResult<NetBundle> | null { return null; }
    customOperationLogic(operation: string): boolean { return true; }
    /* eslint-enable @typescript-eslint/no-unused-vars */
}
export const getNetBundleAuthorizer = (): Promise<NetBundleAuthorizer> => {
    return new Promise((resolve) => {
        resolve(new NetBundleAuthorizer(netBundleAuthorizeMap, "netBundle"));
    });
};