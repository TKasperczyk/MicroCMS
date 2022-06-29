import { z } from "zod";

import { CmsMessage, CmsPreMessage } from "./CmsMessage";

export const PacketData = z.object({
    msg: CmsMessage,
    eventName: z.string()
});
export type PacketData = z.infer<typeof PacketData>;

export const PrePacketData = z.object({
    preMsg: CmsPreMessage,
    eventName: z.string()
});
export type PrePacketData = z.infer<typeof PrePacketData>;