"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.netBundleCrud = void 0;
const type_1 = require("./type");
const mongo_1 = require("../../../shared/database/mongo");
class NetBundleCrud extends mongo_1.Crud {
}
;
exports.netBundleCrud = new NetBundleCrud("test", "settings.netBundle", type_1.NetBundleType);
//# sourceMappingURL=crud.js.map