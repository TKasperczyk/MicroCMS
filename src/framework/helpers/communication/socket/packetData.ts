import { Event } from "socket.io";

import { CmsMessage, CmsPreMessage, PacketData, PrePacketData } from "@framework/types/communication/socket";

export const extractPrePacketData = (packet: Event): PrePacketData => {
    return PrePacketData.parse({
        eventName: packet[0],
        preMsg: CmsPreMessage.parse(packet[1])
    });
};

export const extractPacketData = (packet: Event): PacketData => {
    return PacketData.parse({
        eventName: packet[0],
        msg: CmsMessage.parse(packet[1])
    });
};

export const savePacketData = (packetData: PacketData, packet: Event): Event => {
    if (packet.length > 1) {
        packet[0] = packetData.eventName;
        packet[1] = packetData.msg;
    }
    return packet;
};
