import { z } from "zod";

export const TServiceType = z.enum(["net"]);
export type TServiceType = z.input<typeof TServiceType>;