"use strict";

import { NetBundleType } from "./type";

export const createNetBundle = (netBundle: NetBundleType): NetBundleType => {
    return NetBundleType.parse({
        upMbps: 0,
        downMbps: 0,
        availableForService: "net",
        netPrice: 0,
        indefinitePrice: 0,
        installationIndefinitePrice: 0,
        tvPrice: 0,
        availableForConnectionTypeName: "",
        tvBundleName: "",
        business: false
        , ...netBundle as {}});
};