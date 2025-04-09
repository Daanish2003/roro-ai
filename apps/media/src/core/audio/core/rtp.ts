import { RTPStream as BaseStream, RTP as BaseRTP } from "./utils.js"
import { Worker } from "worker_threads"
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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
    private worker: Worker

    constructor(opts: RTPOptions) {
        super()
        this.options = opts
        const workerPath = path.resolve(__dirname,"../../../worker/opus-worker.js");
        this.worker = new Worker(workerPath);
    }

    static create(opts: Partial<RTPOptions> = {}): RTP {
        const mergedOpts: RTPOptions = { ...defaultAudioOptions, ...opts };
        return new RTP(mergedOpts)
    }
    stream() {
        const stream = new RTPStream(
            this,
            this.options,
            this.worker
        )

        this.streams.push(stream)

        return stream

    }
}

export class RTPStream extends BaseStream {
    private options: RTPOptions
    private interrupted: boolean = false
    private worker: Worker;
    constructor(audio: RTP, opts: RTPOptions, worker: Worker){
        super(audio)
        this.options = opts
        this.worker = worker
        this.worker.postMessage({
            type: "config",
            ssrc: this.options.ssrc,
        });

        this.worker.on("message", (message) => {
            if (message.encoded) {
                const buffer = Buffer.from(message.encoded)
                this.output.put(buffer);
            }
            if (message.error) {
                console.error("Encoding error from worker:", message.error);
            }
        });

        this.run()
    }

    async run() {
        for await(const buffer of this.input) {
            if(this.interrupted) return
            if(typeof buffer === 'symbol') {
                continue
            }

            this.handleOutputStream(buffer);
        }
    }

    handleOutputStream(data: Buffer) {
        try {
            this.worker.postMessage({
                type: "encode",
                pcmBuffer: data,
                samplesPerChannel: this.options.samplesPerChannel,
            });
        } catch (error) {
            console.error("Failed to send buffer to worker:", error);
        }
    }

    interrupt() {
        if (!this.interrupted) {
            this.interrupted = true;
            this.worker.postMessage({ type: "interrupt" });
        }
    }

    resume() {
        if (this.interrupted) {
            this.interrupted = false;
            this.worker.postMessage({ type: "resume" });
        }
    }

}