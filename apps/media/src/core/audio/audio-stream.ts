import { packets, utils } from "rtp.js";
import { opusDecoder } from "./audio-encoding.js";

export class AudioInputStream {
    
    private async handleRTPPackets(rtpPackets: Buffer) {
        const stream = this.clearRTPExtension(rtpPackets)
        const pcmData = await opusDecoder(stream)

        console.log(stream)
    }



    private clearRTPExtension(rtpPackets: Buffer) {
        const view = utils.nodeBufferToDataView(rtpPackets)
        const { RtpPacket } = packets

        const report = new RtpPacket(view)

        report.clearExtensions()

        const payload = report.getPayload()

        const stream = utils.dataViewToNodeBuffer(payload)

        return stream
    }
}
