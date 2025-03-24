import { RTPStream as BaseStream, RTP as BaseRTP } from "./utils.js"
import { AudioByteStream } from "../audio-byte-stream.js";
import { utils, packets } from "rtp.js";
import { OpusEncoder } from "../audio-encoding.js";

export interface RTPOptions {
    sampleRate: number,
    channel: number,
    samplesPerChannel: number,
    ssrc: number,
}

const defaultAudioOptions: RTPOptions =  {
    sampleRate: 48000,
    channel: 2,
    samplesPerChannel: 960,
    ssrc: 0,

}

export class RTP extends BaseRTP {
    private options: RTPOptions;
    private streams: RTPStream[] = []

    constructor(opts: RTPOptions) {
        super()
        this.options = opts
    }

    static async create(opts: Partial<RTPOptions> = {}): Promise<RTP> {
        const mergedOpts: RTPOptions = { ...defaultAudioOptions, ...opts };
        return new RTP(mergedOpts)
    }
    stream() {
        const stream = new RTPStream(
            this,
            this.options,
        )

        this.streams.push(stream)

        return stream

    }
}

export class RTPStream extends BaseStream {
    private options: RTPOptions
    private task: Promise<void>
    private rtpSequenceNumber: number = 0;
    private rtpTimestamp: number = 0;
    constructor(audio: RTP, opts: RTPOptions){
        super(audio)
        this.options = opts
        this.task = this.run()
    }

    async run() {
        for await(const buffer of this.input) {
            if(typeof buffer === 'symbol') {
                continue
            }

            await this.handleOutputStream(buffer)
        }
    }

    async handleOutputStream(data: ArrayBuffer) {
        try {
            const samples100Ms = Math.floor(this.options.sampleRate / 50);
            const stream = new AudioByteStream(this.options.sampleRate, this.options.channel, samples100Ms)
            const frames = stream.write(data)
            for await(const frame of frames) {
                const buffer = utils.arrayBufferToNodeBuffer(frame.data.buffer)
                const encodedPackets = OpusEncoder(buffer)
                const view = utils.nodeBufferToDataView(encodedPackets)
                const rtpPackets = this.createRtpPacket(view)
                this.output.put(rtpPackets)
            }
        } catch (error) {
            console.error("Failed to handle output stream:", error);
        }
    }

    private createRtpPacket(view: DataView): Buffer {
        const { RtpPacket } = packets;
        const rtpPacket = new RtpPacket();
        rtpPacket.setPayload(view);
        rtpPacket.setPayloadType(100);
        rtpPacket.setSequenceNumber(this.rtpSequenceNumber++);
        rtpPacket.setTimestamp(this.rtpTimestamp);
        this.rtpTimestamp += 960;
        rtpPacket.setSsrc(this.options.ssrc);
        const packetLength = rtpPacket.getByteLength();
        const arrayBuffer = new ArrayBuffer(packetLength);
        rtpPacket.serialize(arrayBuffer);
        const buffer = utils.arrayBufferToNodeBuffer(arrayBuffer)
        return buffer
    }
}