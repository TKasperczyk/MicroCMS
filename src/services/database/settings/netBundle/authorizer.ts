import { Authorizer } from "@framework/helpers/communication";

import { TAuthorizeMap } from "@framework/types/communication";

import { TNetBundle } from "./type";

const netBundleTAuthorizeMap: TAuthorizeMap = {
    user: {
        "test": {
        }
    },
    group: {
        "testGroup": {
            hiddenReadFields: ["name"],
            forbiddenWriteFields: { fields: ["name"], excludedOperations: undefined },
        }
    }
};

export class NetBundleAuthorizer extends Authorizer<TNetBundle> { }

export const getNetBundleAuthorizer = (): Promise<NetBundleAuthorizer> => {
    return new Promise((resolve) => {
        resolve(new NetBundleAuthorizer(netBundleTAuthorizeMap, "netBundle"));
    });
};