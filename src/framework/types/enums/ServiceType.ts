import { z } from "zod";

export const TServiceType = z.enum(["net"]);
export type TServiceType = z.infer<typeof TServiceType>;