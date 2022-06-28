import { z } from "zod";

export const SetupObject = z.object({
    port: z.number()
});

export type SetupObject = z.infer<typeof SetupObject>;