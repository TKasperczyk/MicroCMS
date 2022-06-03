"use strict";

import { NetBundleType } from "./type";
import { Crud } from "../../../shared/database/mongo";

class NetBundleCrud extends Crud<NetBundleType> { };

export const netBundleCrud = new NetBundleCrud("test", "settings.netBundle", NetBundleType);
