import opus from "@discordjs/opus"
import { OpusDecoderWebWorker } from "opus-decoder"
import { packets, utils } from "rtp.js"
import f  from "audify"

export const audifyEncoder = new f.OpusEncoder(48000, 1, f.OpusApplication.OPUS_APPLICATION_AUDIO)
export const encoder = new opus.OpusEncoder(48000, 1)

const decoder = new OpusDecoderWebWorker({
            sampleRate: 48000,
            channels: 1,
})

function clearRTPExtension(rtpPackets: Buffer) {
        const view = utils.nodeBufferToDataView(rtpPackets)
        const { RtpPacket } = packets
        const report = new RtpPacket(view)
        report.clearExtensions()
        const payload = report.getPayload()
        const stream = utils.dataViewToNodeBuffer(payload)
        return stream
}

async function handleDecoding(stream: Buffer) {
    const audio = await decoder.decodeFrame(stream)

    const fdata = audio.channelData[0]!

    console.log(audio)
    const int16Data = Int16Array.from(fdata.subarray(0, 512), (x) => x * 32767);

    return int16Data;
}

export async function decodeOpus(stream: Buffer) {
    const audioStream = clearRTPExtension(stream);
    const pcmData = await handleDecoding(audioStream);

    console.log("pcm ", pcmData)
}