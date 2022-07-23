import { z } from "zod";

export const TSetupObject = z.object({
    port: z.number()
}).strict();

export type TSetupObject = z.input<typeof TSetupObject>;