import { Event } from "socket.io";

import { CmsMessage, PacketData } from "@framework/types/communication/socket";

export const extractPacketData = (packet: Event): PacketData => {
    return {
        eventName: packet[0],
        msg: packet[1] as CmsMessage
    } as PacketData;
};

export const savePacketData = (packetData: PacketData, packet: Event): Event => {
    if (packet.length > 1) {
        packet[0] = packetData.eventName;
        packet[1] = packetData.msg;
    }
    return packet;
};
