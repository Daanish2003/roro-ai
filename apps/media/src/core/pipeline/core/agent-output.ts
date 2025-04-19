import EventEmitter from "node:events";
import { TTS } from "../../tts/index.js";
import { CancellablePromise, Future, gracefullyCancel } from "../../../utils/index.js";
import { RTP } from "../../audio/core/rtp.js";
import { Producer } from "mediasoup/node/lib/types.js";
import { LLM } from "../../llm/llm.js";

export type SpeechSource = AsyncIterable<string> | string | Promise<string>;

export class AgentOutput extends EventEmitter {
    #tts: TTS;
    #rtp: RTP;
    #llm: LLM;
    #producerTrack: Producer;
    #ttsTask?: CancellablePromise<void>;
    #rtpTask?: CancellablePromise<void>;
    #speaking: boolean = false;
    #closed: boolean = false;
    #llmStream?: ReturnType<LLM["chat"]>;
    #ttsStream?: ReturnType<TTS["stream"]>;
    #rtpStream?: ReturnType<RTP["stream"]>;
    #llmTask?: CancellablePromise<void>;
    #interrupted = false

    constructor(tts: TTS, llm: LLM, producerTrack: Producer, ssrc: number) {
        super();
        this.#tts = tts;
        this.#llm = llm;
        this.#producerTrack = producerTrack;

        this.#rtp = RTP.create({
            channel: 1,
            sampleRate: 48000,
            samplesPerChannel: 960,
            ssrc
        });
    }

    async agentReplyTask(inputText: string) {
        if (this.#closed) throw new Error("AgentOutput is already closed");

        const future = new Future();

        if(this.#interrupted) {
            future.resolve()
        }

        if (this.#ttsTask || this.#rtpTask || this.#llmTask) {
            await this.reset();
        }

        this.#interrupted = false;

        const packetQueue: Buffer[] = [];

        this.#llmStream = this.#llm.chat();
        this.#ttsStream = this.#tts.stream();
        this.#rtpStream = this.#rtp!.stream();
        this.#llmStream.sendChat(inputText)

        this.#llmTask = new CancellablePromise(async (resolve, _, onCancel) => {
            let cancelled = false;
            onCancel(() => {
                cancelled = true;
            });
        
            try {
                for await (const text of this.#llmStream!) {
                    if (cancelled || this.#interrupted) break;
                    this.#ttsStream!.push(text);
                }
            } catch (err) {
                future.reject(err as Error);
            }

            resolve();
        });

        this.#ttsTask = new CancellablePromise(async (resolve, _, onCancel) => {
            let cancelled = false;
            onCancel(() => {
                cancelled = true;
            });

            try {
                for await (const buffer of this.#ttsStream!) {
                    if (cancelled) break;
                    this.emit("AGENT_START_SPEAKING")
                    if(this.#interrupted) return
                    this.#rtpStream!.pushStream(buffer);
                }
            } catch (err) {
                future.reject(err as Error);
            }

            this.#ttsStream?.flush();
            this.#ttsStream?.endInput();
            resolve()
        });

        this.#rtpTask = new CancellablePromise(async (resolve, _, onCancel) => {
            let cancelled = false;
            const interval = setInterval(() => {
                if (cancelled) return;

                if (packetQueue.length > 0) {
                    this.#speaking = true;
                    const rtpPacket = packetQueue.shift();
                    if (rtpPacket) {
                        if(this.#interrupted) return
                        this.#producerTrack.send(rtpPacket);
                    }
                } else if (this.#speaking) {
                    this.#speaking = false;
                    this.emit("AGENT_STOP_SPEAKING");
                }
            }, 20);

            onCancel(() => {
                cancelled = true;
                clearInterval(interval);
            });

            try {
                for await (const rtpPacket of this.#rtpStream!) {
                    if (cancelled) break;
                    packetQueue.push(rtpPacket);
                }
            } catch (err) {
                future.reject(err as Error);
            }

            clearInterval(interval);
            packetQueue.length = 0
            this.#rtpStream?.flush()
            this.#rtpStream?.endInput()
            resolve();
        });

        Promise.all([
            this.#llmTask,
            this.#ttsTask,
            this.#rtpTask,
        ]).then(() => {
            if (!future.done) future.resolve();
        }).catch((err) => {
            future.reject(err);
        });

        return future.await;
    }

    async reset() {
        if(this.#llmStream) {
            this.#llmStream.interrupt()
        }
        if(this.#ttsStream) {
            this.#ttsStream.interrupt()
        }

        if(this.#rtpStream) {
            this.#rtpStream.interrupt()
        }

        if(this.#llmTask) {
            gracefullyCancel(this.#llmTask)
        }

        if(this.#ttsTask) {
            gracefullyCancel(this.#ttsTask)
        }
        
        if(this.#rtpTask) {
            gracefullyCancel(this.#rtpTask)
        }
    }

    async interrupt() {
        console.log("⚠️ Interrupting agent...");
        this.#interrupted = true
        this.emit("AGENT_INTERRUPTED");

        this.reset()
    }

    close() {
        this.#closed = true;
        this.#ttsStream?.closeConnection()
        this.interrupt();
        this.removeAllListeners();
    }
}
