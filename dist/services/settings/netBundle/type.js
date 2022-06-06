"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetBundleType = void 0;
const zod_1 = require("zod");
const ServiceType_1 = require("../../../shared/types/enums/ServiceType");
const mongo_1 = require("../../../shared/database/mongo");
;
exports.NetBundleType = zod_1.z.lazy(() => zod_1.z.object({
    _id: zod_1.z.instanceof(mongo_1.ObjectId).optional(),
    name: zod_1.z.string(),
    upMbps: zod_1.z.number(),
    downMbps: zod_1.z.number(),
    availableForService: ServiceType_1.ServiceType,
    netPrice: zod_1.z.number(),
    indefinitePrice: zod_1.z.number(),
    installationIndefinitePrice: zod_1.z.number(),
    tvPrice: zod_1.z.number(),
    availableForConnectionTypeName: zod_1.z.string(),
    tvBundleName: zod_1.z.string(),
    business: zod_1.z.preprocess((val) => Boolean(val), zod_1.z.boolean())
}));
//# sourceMappingURL=type.js.map