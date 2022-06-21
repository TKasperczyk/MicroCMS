import { z } from "zod";

//Test

export const ServiceType = z.enum(["net"]);
export type ServiceType = z.infer<typeof ServiceType>;