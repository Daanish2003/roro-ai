import { RTPStream as BaseStream, RTP as BaseRTP } from "./utils.js"
import { utils, packets } from "rtp.js";
import { encoder } from "../audio-encoding.js";


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
    private rtpSequenceNumber: number = 0;
    private rtpTimestamp: number = 0;

    constructor(opts: RTPOptions) {
        super()
        this.options = opts
    }

    static create(opts: Partial<RTPOptions> = {}): RTP {
        const mergedOpts: RTPOptions = { ...defaultAudioOptions, ...opts };
        return new RTP(mergedOpts)
    }

    getNextSequenceNumber(): number {
        return this.rtpSequenceNumber++;
    }

    getNextTimestamp(): number {
        const ts = this.rtpTimestamp;
        this.rtpTimestamp += this.options.samplesPerChannel;
        return ts;
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
    private interrupted: boolean = false
    constructor(audio: RTP, opts: RTPOptions){
        super(audio)
        this.options = opts
        this.task = this.run()
    }

    async run() {
        for await(const buffer of this.input) {
            if(this.interrupted) return
            if(typeof buffer === 'symbol') {
                continue
            }

            await this.handleOutputStream(buffer)
        }
    }

    async handleOutputStream(data: Buffer) {
        try {
            const encodedPackets = encoder.encode(data)
            const rtpPackets = this.createRtpPacket(encodedPackets)
            if(this.interrupted) return
            this.output.put(rtpPackets)
        } catch (error) {
            console.error("Failed to handle output stream:", error);
        }
    }

    private createRtpPacket(opusPayload: Buffer): Buffer {
        const { RtpPacket } = packets;
        const rtpPacket = new RtpPacket();
        rtpPacket.setPayloadType(100);
        rtpPacket.setSequenceNumber(this.audio.getNextSequenceNumber());
        rtpPacket.setTimestamp(this.audio.getNextTimestamp());
        rtpPacket.enableOneByteExtensions()
        rtpPacket.setSsrc(this.options.ssrc);
        const payloadDataView = new DataView(opusPayload.buffer, opusPayload.byteOffset, opusPayload.byteLength);
        rtpPacket.setPayload(payloadDataView)
        const packetLength = rtpPacket.getByteLength();
        const arrayBuffer = new ArrayBuffer(packetLength);
        rtpPacket.serialize(arrayBuffer);
        const buffer = utils.arrayBufferToNodeBuffer(arrayBuffer)
        return buffer
    }

    interrupt() {
        this.interrupted = true;
    }
}