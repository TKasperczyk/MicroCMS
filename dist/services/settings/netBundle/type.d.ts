import { z } from "zod";
import { ServiceType } from "../../../shared/types/enums/ServiceType";
import { ObjectId } from "../../../shared/database/mongo";
export interface NetBundleType {
    _id?: ObjectId;
    name: string;
    upMbps: number;
    downMbps: number;
    availableForService: ServiceType;
    netPrice: number;
    indefinitePrice: number;
    installationIndefinitePrice: number;
    tvPrice: number;
    availableForConnectionTypeName: string;
    tvBundleName: string;
    business: boolean;
}
export declare const NetBundleType: z.ZodType<NetBundleType>;
