import { z } from "zod";

export const ServiceType = z.enum(["net"]);
export type ServiceType = z.infer<typeof ServiceType>;