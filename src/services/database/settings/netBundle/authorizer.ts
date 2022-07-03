import { Authorizer } from "@framework/helpers/communication";

import { TAuthorizeMap, TApiResult } from "@framework/types/communication";
import { TLooseObject } from "@framework/types/generic";

import { NetBundle } from "./type";

const netBundleTAuthorizeMap: TAuthorizeMap = {
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
    customOutputLogic(response: TApiResult<NetBundle>, user: TLooseObject): TApiResult<NetBundle> | null { return null; }
    customOperationLogic(operation: string): boolean { return true; }
    /* eslint-enable @typescript-eslint/no-unused-vars */
}
export const getNetBundleAuthorizer = (): Promise<NetBundleAuthorizer> => {
    return new Promise((resolve) => {
        resolve(new NetBundleAuthorizer(netBundleTAuthorizeMap, "netBundle"));
    });
};