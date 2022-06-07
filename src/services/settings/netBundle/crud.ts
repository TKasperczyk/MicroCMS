"use strict";

import { NetBundleType } from "./type";
import { createNetBundle } from "./factory";
import { Crud } from "../../../shared/database/mongo";


export class NetBundleCrud extends Crud<NetBundleType> { };
export const netBundleCrud = new NetBundleCrud("test", "settings.netBundle", NetBundleType, createNetBundle, [], ["name"]);
