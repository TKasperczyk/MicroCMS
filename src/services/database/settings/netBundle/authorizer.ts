import { Authorizer } from "@framework/helpers/communication";

import { TAuthorizeMap } from "@framework/types/communication";

import { TNetBundle } from "./type";

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

export class NetBundleAuthorizer extends Authorizer<TNetBundle> { }

export const getNetBundleAuthorizer = (): Promise<NetBundleAuthorizer> => {
    return new Promise((resolve) => {
        resolve(new NetBundleAuthorizer(netBundleTAuthorizeMap, "netBundle"));
    });
};