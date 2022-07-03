import { z } from "zod";

import { TCmsMessage, TCmsPreMessage } from "@framework/types/communication/socket/CmsMessage";

export const TPacketData = z.object({
    msg: TCmsMessage,
    eventName: z.string()
});
export type TPacketData = z.infer<typeof TPacketData>;

export const TPrePacketData = z.object({
    preMsg: TCmsPreMessage,
    eventName: z.string()
});
export type TPrePacketData = z.infer<typeof TPrePacketData>;