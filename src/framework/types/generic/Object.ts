import { z } from "zod";

export const TLooseObject = z.record(z.any());
export type TLooseObject = z.infer<typeof TLooseObject>;

export interface TStringObject {
    [key: string]: string
}