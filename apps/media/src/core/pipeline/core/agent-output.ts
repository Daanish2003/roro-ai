import EventEmitter from "node:events";
import { LLM } from "../../llm/llm.js";
import { TTS } from "../../tts/index.js";
import { CancellablePromise, gracefullyCancel } from "../../../utils/index.js";
import { RTP } from "../../audio/core/rtp.js";
import { Producer } from "mediasoup/node/lib/types.js";

export class AgentOutput extends EventEmitter {
    #llm: LLM;
    #tts: TTS;
    #rtp?: RTP
    #producerTrack?: Producer
    #llmTask?: CancellablePromise<void>;
    #ttsTask?: CancellablePromise<void>;
    #rtpTask?: CancellablePromise<void>;
    #speaking: boolean = false;
    #closed: boolean = false;
    #isInterupting: boolean = false

    constructor(llm: LLM, tts: TTS, producerTrack: Producer) {
        super();
        this.#llm = llm;
        this.#tts = tts;
        this.#producerTrack = producerTrack
        this.#rtp = RTP.create({
            channel: 1,
            sampleRate: 48000,
            samplesPerChannel: 960,
            ssrc: this.#producerTrack!.rtpParameters.encodings![0]?.ssrc
        })
    }

    run(text: string) {
        if (this.#closed) throw new Error("AgentOutput is already closed");

        const llmStream = this.#llm.chat();
        const ttsStream = this.#tts.stream();
        const rtpStream = this.#rtp!.stream()

        llmStream.push(text)

        this.#llmTask = new CancellablePromise(async (resolve, _, onCancel) => {
            let cancelled = false;
            onCancel(() => { 
                cancelled = true 
                llmStream.cancel()
                llmStream.flush()
                llmStream.endInput()
            });

            for await (const text of llmStream) {
                if (cancelled) break;
                console.log(text)
                ttsStream.push(text);
                this.emit("AGENT_COMMITTED");
            }

            llmStream.close();
            resolve();
        });

        this.#ttsTask = new CancellablePromise(async (resolve, _, onCancel) => {
            let cancelled = false;
            onCancel(() => { 
                cancelled = true 
                ttsStream.cancel()
                ttsStream.flush()
                ttsStream.endInput()
            });

            for await (const buffer of ttsStream) {
                if (cancelled) break;
                rtpStream?.pushStream(buffer)
                this.emit("AGENT_START_SPEAKING")
            }

            ttsStream.close();
            resolve();
        });

        this.#rtpTask = new CancellablePromise(async (resolve, _, onCancel) => {
            let cancelled = false;
            onCancel(() => { 
                cancelled = true 
                rtpStream.cancel()
                rtpStream.flush()
                rtpStream.endInput()
            });
        
            const packetQueue: Buffer[] = [];
        
            const reader = (async () => {
                for await (const rtpPacket of rtpStream) {
                    console.log(rtpPacket)
                    if (cancelled) break;
                    packetQueue.push(rtpPacket);
                }
            })();
        
            const interval = setInterval(() => {
                if (cancelled) return;
        
                if (packetQueue.length > 0) {
                    this.#speaking = true;
                    const rtpPacket = packetQueue.shift();
                    this.#producerTrack?.send(rtpPacket!);
                } else {
                    if(this.#speaking) {
                        this.#speaking = false
                        this.emit('AGENT_STOP_SPEAKING')
                    }
                }
            }, 20);
        
            onCancel(() => {
                clearInterval(interval);
            });
        
    
            await reader;
            clearInterval(interval);
            resolve();
        });
        
    }

    async interrupt() {
        if (this.#closed) return;
        await Promise.all([
            this.#llmTask ? gracefullyCancel(this.#llmTask) : undefined,
            this.#ttsTask ? gracefullyCancel(this.#ttsTask) : undefined,
            this.#rtpTask ? gracefullyCancel(this.#rtpTask) : undefined
        ]);
    
        this.#llmTask = undefined;
        this.#ttsTask = undefined;
        this.#rtpTask = undefined;

        this.#speaking = false;
    
        this.emit("AGENT_INTERRUPTED");
    }
    
    get isInterupting() {
        return this.#isInterupting
    }
}
