"use strict";

import { Crud } from "@framework/database/mongo";

import { createNetBundle } from "./factory";
import { NetBundle } from "./type";


export class NetBundleCrud extends Crud<NetBundle> { }
export const netBundleCrud = new NetBundleCrud("test", "settings.netBundle", NetBundle, createNetBundle, [], ["name"]);
