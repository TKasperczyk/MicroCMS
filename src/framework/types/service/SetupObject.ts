import { z } from "zod";

export const TSetupObject = z.object({
    port: z.number()
});

export type TSetupObject = z.infer<typeof TSetupObject>;