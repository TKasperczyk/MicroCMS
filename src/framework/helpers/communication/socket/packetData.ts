import { Event } from "socket.io";

import { TCmsMessage, TCmsPreMessage, TPacketData, TPrePacketData } from "@framework/types/communication/socket";

export const extractTPrePacketData = (packet: Event): TPrePacketData => {
    return TPrePacketData.parse({
        eventName: packet[0],
        preMsg: TCmsPreMessage.parse(packet[1])
    });
};

export const extractPacketData = (packet: Event): TPacketData => {
    return TPacketData.parse({
        eventName: packet[0],
        msg: TCmsMessage.parse(packet[1])
    });
};

export const savePacketData = (packetData: TPacketData, packet: Event): Event => {
    if (packet.length > 1) {
        packet[0] = packetData.eventName;
        packet[1] = packetData.msg;
    }
    return packet;
};
