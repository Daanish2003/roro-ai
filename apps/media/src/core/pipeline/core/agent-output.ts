import EventEmitter from "node:events";
import { TTS } from "../../tts/index.js";
import { CancellablePromise, Future } from "../../../utils/index.js";
import { RTP } from "../../audio/core/rtp.js";
import { Producer } from "mediasoup/node/lib/types.js";
import { LLM } from "../../llm/llm.js";

export type SpeechSource = AsyncIterable<string> | string | Promise<string>;

export class AgentOutput extends EventEmitter {
    #tts: TTS;
    #rtp?: RTP;
    #llm: LLM;
    #producerTrack: Producer;
    #llmTask?: CancellablePromise<void>;
    #ttsTask?: CancellablePromise<void>;
    #rtpTask?: CancellablePromise<void>;
    #speaking: boolean = false;
    #closed: boolean = false;
    #interrupted: boolean = false;

    #llmStream: ReturnType<LLM["chat"]>;
    #ttsStream: ReturnType<TTS["stream"]>;
    #rtpStream: ReturnType<RTP["stream"]>;

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

        this.#llmStream = this.#llm.chat();
        this.#ttsStream = this.#tts.stream();
        this.#rtpStream = this.#rtp.stream();
    }

    async agentReplyTask(inputText: string) {
        if (this.#closed || this.#interrupted) {
            console.warn("AgentOutput is closed or interrupted, cannot start reply task.");
            return;
        }

        const future = new Future();
        const packetQueue: Buffer[] = [];

        try {
            this.#llmStream.sendChat(inputText);
        } catch (error) {
            console.error("Failed to send chat input:", error);
            future.reject(error as Error);
            return future.await;
        }

        this.#llmTask = new CancellablePromise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => {
                cancelled = true;
                try {
                    this.#llmStream.close();
                } catch (error) {
                    console.warn("Error closing LLM stream during cancellation:", error);
                }
            });

            try {
                for await (const output of this.#llmStream) {
                    if (cancelled || this.#interrupted) break;
                    console.log("🧠 LLM Output", output);
                    try {
                        if (!this.#interrupted) {
                            this.#ttsStream.push(output);
                        }
                    } catch (error: any) {
                        if (cancelled || this.#interrupted) {
                            // Expected if interrupted or cancelled
                            break;
                        } else if (error.message === "Input is closed") {
                            console.warn("TTS stream input closed unexpectedly during LLM output.");
                            break;
                        } else {
                            console.error("Error pushing to TTS stream:", error);
                            reject(error);
                            return;
                        }
                    }
                }
            } catch (err) {
                if (!cancelled && !this.#interrupted) {
                    console.error("LLM stream error:", err);
                    reject(err);
                }
            } finally {
                try {
                    if (!cancelled && !this.#interrupted) {
                        this.#ttsStream.endInput();
                    }
                } catch (error: any) {
                    if (error.message === "Input is closed") {
                        console.warn("TTS stream input already closed.");
                    } else if (!cancelled && !this.#interrupted) {
                        console.error("Error ending TTS input:", error);
                    }
                }
                resolve();
            }
        });

        this.#ttsTask = new CancellablePromise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => {
                cancelled = true;
                try {
                    this.#ttsStream.close();
                } catch (error) {
                    console.warn("Error closing TTS stream during cancellation:", error);
                }
                try {
                    if (!this.#interrupted) {
                        this.#rtpStream.endInput();
                    }
                } catch (error: any) {
                    if (error.message === "Input is closed") {
                        console.warn("RTP stream input already closed during TTS processing.");
                    } else if (!cancelled && !this.#interrupted) {
                        console.error("Error ending RTP input:", error);
                    }
                }
            });

            try {
                for await (const buffer of this.#ttsStream) {
                    if (cancelled || this.#interrupted) break;
                    try {
                        if (!this.#interrupted) {
                            this.#rtpStream.pushStream(buffer);
                        }
                    } catch (error: any) {
                        if (cancelled || this.#interrupted) {
                            // Expected if interrupted or cancelled
                            break;
                        } else if (error.message === "Input is closed") {
                            console.warn("RTP stream input closed unexpectedly during TTS output.");
                            break;
                        } else {
                            console.error("Error pushing to RTP stream:", error);
                            reject(error);
                            return;
                        }
                    }
                }
            } catch (err) {
                if (!cancelled && !this.#interrupted) {
                    console.error("TTS stream error:", err);
                    reject(err);
                }
            } finally {
                try {
                    if (!cancelled && !this.#interrupted) {
                        this.#rtpStream.endInput();
                    }
                } catch (error: any) {
                    if (error.message === "Input is closed") {
                        console.warn("RTP stream input already closed.");
                    } else if (!cancelled && !this.#interrupted) {
                        console.error("Error ending RTP input:", error);
                    }
                }
                resolve();
            }
        });

        this.#rtpTask = new CancellablePromise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            const interval = setInterval(() => {
                if (cancelled || this.#interrupted) {
                    clearInterval(interval);
                    packetQueue.length = 0;
                    if (this.#speaking) {
                        this.#speaking = false;
                        this.emit("AGENT_STOP_SPEAKING");
                    }
                    return;
                }

                if (packetQueue.length > 0) {
                    this.#speaking = true;
                    const rtpPacket = packetQueue.shift();
                    if (rtpPacket && !this.#interrupted) {
                        try {
                            this.#producerTrack.send(rtpPacket);
                        } catch (error) {
                            console.warn("Error sending RTP packet:", error);
                        }
                    }
                } else if (this.#speaking && 
                          (this.#llmTask?.isCancelled || 
                           this.#ttsTask?.isCancelled || 
                           packetQueue.length === 0)) {
                    this.#speaking = false;
                    this.emit("AGENT_STOP_SPEAKING");
                }
            }, 20);

            onCancel(() => {
                cancelled = true;
                clearInterval(interval);
                packetQueue.length = 0;
                try {
                    this.#rtpStream.close();
                } catch (error) {
                    console.warn("Error closing RTP stream during cancellation:", error);
                }
            });

            try {
                for await (const rtpPacket of this.#rtpStream) {
                    if (cancelled || this.#interrupted) break;
                    packetQueue.push(rtpPacket);
                }
            } catch (err) {
                if (!cancelled && !this.#interrupted) {
                    console.error("RTP stream error:", err);
                    reject(err);
                }
            } finally {
                clearInterval(interval);
                resolve();
            }
        });

        Promise.all([
            this.#llmTask.catch(error => {
                if (!this.#llmTask?.isCancelled && !this.#interrupted) {
                    console.error("LLM Task failed:", error);
                    future.reject(error);
                } else {
                    console.log("LLM Task cancelled or interrupted.");
                }
            }),
            this.#ttsTask.catch(error => {
                if (!this.#ttsTask?.isCancelled && !this.#interrupted) {
                    console.error("TTS Task failed:", error);
                    future.reject(error);
                } else {
                    console.log("TTS Task cancelled or interrupted.");
                }
            }),
            this.#rtpTask.catch(error => {
                if (!this.#rtpTask?.isCancelled && !this.#interrupted) {
                    console.error("RTP Task failed:", error);
                    future.reject(error);
                } else {
                    console.log("RTP Task cancelled or interrupted.");
                }
            }),
        ]).then(() => {
            if (!future.done) future.resolve();
        });

        return future.await;
    }

    async interrupt() {
        if (this.#closed || this.#interrupted) {
            console.warn("AgentOutput is already closed or interrupted, cannot interrupt again.");
            return;
        }
        
        console.log("⚠️ Interrupting agent...");
        this.#interrupted = true;
        
        // Cancel all tasks first before closing streams
        if (this.#llmTask) this.#llmTask.cancel();
        if (this.#ttsTask) this.#ttsTask.cancel();
        if (this.#rtpTask) this.#rtpTask.cancel();
        
        // Close streams in correct order with proper error handling
        try {
            this.#llmStream.close();
        } catch (error) {
            console.warn("Error closing LLM stream during interrupt:", error);
        }
        
        try {
            this.#ttsStream.close();
        } catch (error) {
            console.warn("Error closing TTS stream during interrupt:", error);
        }
        
        try {
            this.#rtpStream.close();
        } catch (error) {
            console.warn("Error closing RTP stream during interrupt:", error);
        }
        
        this.emit("AGENT_INTERRUPTED");
        this.#speaking = false;
    }

    close() {
        if (this.#closed) {
            console.warn("AgentOutput is already closed.");
            return;
        }
        
        // If not interrupted yet, interrupt first to handle task cancellation
        if (!this.#interrupted) {
            this.interrupt();
        }
        
        this.#closed = true;
        this.removeAllListeners();
    }
    
    // Helper to recreate streams for a new conversation if needed
    recreateStreams() {
        if (this.#closed) {
            console.warn("Cannot recreate streams for closed AgentOutput.");
            return false;
        }
        
        if (this.#interrupted) {
            try {
                // Only recreate if previously interrupted but not closed
                this.#llmStream = this.#llm.chat();
                this.#ttsStream = this.#tts.stream();
                this.#rtpStream = this.#rtp!.stream();
                this.#interrupted = false;
                return true;
            } catch (error) {
                console.error("Failed to recreate streams:", error);
                return false;
            }
        }
        
        return true; // No need to recreate
    }
}