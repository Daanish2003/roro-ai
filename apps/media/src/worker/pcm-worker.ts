import { parentPort } from "worker_threads";
import { packets, utils } from "rtp.js"
import { OpusDecoderWebWorker } from "opus-decoder";



if (!parentPort) {
    throw new Error("This file should be run as a worker thread.");
}

const decoder = new OpusDecoderWebWorker({
    sampleRate: 16000,
    channels: 2,
    streamCount: 1,
    coupledStreamCount: 1,
    forceStereo: false,
    channelMappingTable: [0, 1],
})



parentPort.on('message', async (message) => {
    if (message === undefined) return;
    const buffer = Buffer.from(message)
    const pcmdata = await decodeOpus(buffer)
    parentPort!.postMessage(pcmdata)
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

    const int16Data = Int16Array.from(fdata.subarray(0, 512), (x) => x * 32767);

    return int16Data;
}

export async function decodeOpus(stream: Buffer) {
    const audioStream = clearRTPExtension(stream);
    const pcmData = await handleDecoding(audioStream);

    return pcmData
}