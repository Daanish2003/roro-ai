import { AudioFrame } from "../audio-frame.js";
import { Worker } from "worker_threads"
import { fileURLToPath } from "url";
import path from "node:path";
import EventEmitter from "node:events";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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


export class AudioStream extends EventEmitter {
    private options: AudioOptions
    private worker: Worker
    constructor(opts: AudioOptions = defaultAudioOptions){
        super()
        this.options = opts
        const workerPath = path.resolve(__dirname,"../../../worker/pcm-worker.js");
        this.worker = new Worker(workerPath);
        this.worker.on("message", (message) => {
            if (message) {               
               const data = message
                const frame = new AudioFrame(data, 16000, 1, 512)
                this.emit('FRAME', frame)
            }
            if (message.error) {
                console.error("Encoding error from worker:", message.error);
            }
        });
    }

    run(buffer: Buffer) {
        this.handleInputStream(buffer)
    }

    handleInputStream(stream: Buffer) {
        try {
            if(stream === undefined) return
            this.worker.postMessage(stream)
        } catch (error) {
            console.error("Failed to handle input stream:", error);
        }
    }
}