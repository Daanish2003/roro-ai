import { parentPort } from "worker_threads";
import { packets, utils } from "rtp.js"
import opus from "@discordjs/opus"

let sequenceNumber = 0;
let timestamp = 0;
let ssrc = 1234; 
let interrupted = false

export const encoder = new opus.OpusEncoder(48000, 1)

if (!parentPort) {
    throw new Error("This file should be run as a worker thread.");
}

parentPort.on('message', (message) => {
    const { type } = message

    if(type === "config") {
        if(message.ssrc !== undefined) {
            ssrc = message.ssrc
            sequenceNumber = 0
            timestamp = 0
        }

        return
    }

    if (type === 'interrupt') {
        interrupted = true
        return
    }

    if (type === 'resume') {
        interrupted = false;
        return;
    }

    if (type === 'encode') {
        if (interrupted) return;
        try {
            const { pcmBuffer, samplesPerChannel } = message;
            const opusPayload = encoder.encode(pcmBuffer)

            const { RtpPacket } = packets;
            const rtpPacket = new RtpPacket();
            rtpPacket.setPayloadType(100);
            rtpPacket.setSequenceNumber(sequenceNumber++);
            rtpPacket.setTimestamp(timestamp);
            rtpPacket.enableOneByteExtensions();
            rtpPacket.setSsrc(ssrc);
            timestamp += samplesPerChannel;

            const view = new DataView(opusPayload.buffer, opusPayload.byteOffset, opusPayload.byteLength);
            rtpPacket.setPayload(view);
            const byteLength = rtpPacket.getByteLength();
            const arrayBuffer = new ArrayBuffer(byteLength);
            rtpPacket.serialize(arrayBuffer);

            const encoded = utils.arrayBufferToNodeBuffer(arrayBuffer);
            parentPort!.postMessage({ encoded });
        } catch (err) {
            console.error("Worker encode error:", err);
            parentPort!.postMessage({ error: (err as Error).message });
          }
    } 
})