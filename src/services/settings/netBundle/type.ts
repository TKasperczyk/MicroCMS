"use strict";

import { z } from "zod";
import { ServiceType } from "../../../shared/types/enums";
import { ObjectId } from "../../../shared/database/mongo";

export interface NetBundleType {
    _id?: ObjectId,
    name: string,
    upMbps: number,
    downMbps: number,
    availableForService: ServiceType,
    netPrice: number,
    indefinitePrice: number,
    installationIndefinitePrice: number,
    tvPrice: number,
    availableForConnectionTypeName: string,
    tvBundleName: string,
    business: boolean,
};

export const NetBundleType: z.ZodType<NetBundleType> = z.lazy(() => z.object({
    _id: z.instanceof(ObjectId).optional(),
    name: z.string(),
    upMbps: z.number(),
    downMbps: z.number(),
    availableForService: ServiceType,
    netPrice: z.number(),
    indefinitePrice: z.number(),
    installationIndefinitePrice: z.number(),
    tvPrice: z.number(),
    availableForConnectionTypeName: z.string(),
    tvBundleName: z.string(),
    business: z.preprocess((val) => Boolean(val), z.boolean())
}));
