import { CmsMessage } from "./CmsMessage";

export interface PacketData {
    msg: CmsMessage,
    eventName: string
}