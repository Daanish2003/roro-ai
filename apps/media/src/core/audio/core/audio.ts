import { OpusDecoderWebWorker } from "opus-decoder";
import { AudioStream as BaseStream } from "./utils.js"
import { AudioFrame } from "../audio-frame.js";
import { packets, utils } from "rtp.js";

export interface AudioOptions {
    sampleRate: number,
    channel: number,
    samplesPerChannel: number
}

const defaultAudioOptions =  {
    sampleRate: 16000,
    channel: 1,
    samplesPerChannel: 512
}

export class Audio {
    private options: AudioOptions;
    private decoder: OpusDecoderWebWorker<16000>
    private _stream: AudioStream | null = null

    constructor(opts: AudioOptions) {
        this.options = opts
        this.decoder = new OpusDecoderWebWorker({
            sampleRate: 16000,
            channels: 2,
            streamCount: 1,
            coupledStreamCount: 1,
            forceStereo: false,
            channelMappingTable: [0, 1],
        })
    }

    static async create(opts: Partial<AudioOptions> = {}): Promise<Audio> {
        const mergedOpts: AudioOptions = { ...defaultAudioOptions, ...opts };
        return new Audio(mergedOpts)
    }
    stream() {
        const stream = new AudioStream(
            this,
            this.options,
            this.decoder,
        )

        this._stream = stream

        return stream

    }
}

export class AudioStream extends BaseStream {
    private options: AudioOptions
    private decoder: OpusDecoderWebWorker<16000>
    private task: Promise<void>
    constructor(audio: Audio, opts: AudioOptions, decoder: OpusDecoderWebWorker<16000>){
        super(audio)
        this.options = opts
        this.decoder = decoder
        this.initDecoder();
        this.task = this.run()
    }

    private async initDecoder() {
        await this.decoder.ready;
    }

    async run() {
        for await(const buffer of this.input) {
            if(typeof buffer === 'symbol') {
                continue
            }

            await this.handleInputStream(buffer)
        }
    }

    async handleInputStream(stream: Buffer) {
        try {
            const audioStream = this.clearRTPExtension(stream);
            const pcmData = await this.handleDecoding(audioStream);
            const frame = new AudioFrame(pcmData, 16000, 1, 512);
            this.output.put(frame)
        } catch (error) {
            console.error("Failed to handle input stream:", error);
        }
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

    private async handleDecoding(stream: Buffer) {
        const audio = await this.decoder.decodeFrame(stream)

        const fdata = audio.channelData[0]!
        const int16Data = Int16Array.from(fdata.subarray(0, 512), (x) => x * 32767);

        return int16Data;
    }

}