import { z } from "zod";

export const LooseObject = z.record(z.any());
export type LooseObject = z.infer<typeof LooseObject>;

export interface StringObject {
    [key: string]: string
}