"use strict";

import { NetBundle } from "./type";
import { createNetBundle } from "./factory";
import { Crud } from "../../../../shared/database/mongo";


export class NetBundleCrud extends Crud<NetBundle> { };
export const netBundleCrud = new NetBundleCrud("test", "settings.netBundle", NetBundle, createNetBundle, [], ["name"]);
