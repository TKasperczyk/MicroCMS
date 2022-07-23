import { z } from "zod";

import { TCmsMessage, TCmsPreMessage } from "@framework/types/communication/socket/CmsMessage";

export const TPacketData = z.object({
    msg: TCmsMessage,
    eventName: z.string().trim()
}).strict();
export type TPacketData = z.input<typeof TPacketData>;

export const TPrePacketData = z.object({
    preMsg: TCmsPreMessage,
    eventName: z.string().trim()
}).strict();
export type TPrePacketData = z.input<typeof TPrePacketData>;