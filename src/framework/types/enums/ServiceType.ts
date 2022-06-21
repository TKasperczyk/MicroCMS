//eslint-disable-next-line
import { z } from "zod";
//eslint-disable-next-line
import { StringObject } from "@framework/types/generic";

export const ServiceType = z.enum(["net"]);
export type ServiceType = z.infer<typeof ServiceType>;