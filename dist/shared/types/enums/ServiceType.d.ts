import { z } from "zod";
export declare const ServiceType: z.ZodEnum<["net"]>;
export declare type ServiceType = z.infer<typeof ServiceType>;
