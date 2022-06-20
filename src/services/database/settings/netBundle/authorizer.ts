import { Authorizer } from "@framework/helpers/communication";

import { AuthorizeMap } from "@framework/types/communication";

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

export class NetBundleAuthorizer extends Authorizer<NetBundle> { }
export const getNetBundleAuthorizer = (): Promise<NetBundleAuthorizer> => {
    return new Promise((resolve) => {
        resolve(new NetBundleAuthorizer(netBundleAuthorizeMap, "netBundle"));
    });
};