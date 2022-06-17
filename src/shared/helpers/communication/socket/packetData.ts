"use strict";

import { Event } from "socket.io";

import { CmsMessage, PacketData } from "@cmsTypes/index";

export const extractPacketData = (packet: Event): PacketData => {
    return {
        eventName: packet[0],
        msg: packet[1] as CmsMessage
    } as PacketData;
};

export const savePacketData = (packetData: PacketData, packet: Event): Event => {
    packet[0] = packetData.eventName;
    packet[1] = packetData.msg;
    return packet;
};
