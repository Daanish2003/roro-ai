import EventEmitter from "node:events";
import { SpeechEventType, VADEventType } from "../../../utils/event.js";
import { CancellablePromise, gracefullyCancel } from "../../../utils/index.js";
import { VAD } from "../../vad/core/vad.js";
import { STT, STTStream } from "../../stt/index.js";
import { AudioFrame } from "../../audio/audio-frame.js";
import { VADStream } from "../../vad/core/vad.js";


export class UserInput extends EventEmitter {
    private vad: VAD;
    private stt: STT;
    private _speaking: boolean = false;
    private closed = false;
    private task: CancellablePromise<void>
    private vadStream: VADStream
    private sttStream: STTStream

    constructor(vad: VAD, stt: STT) {
        super()
        this.vad = vad
        this.stt = stt
        this.vadStream = this.vad.stream();
        this.sttStream = this.stt.stream();
        this.task = new CancellablePromise(async (resolve, __, onCancel) => {
            let cancelled = false;

            onCancel(() => {
                cancelled = true
            });

            const vadLoop = async () => {
                try {
                    for await (const ev of this.vadStream) {
                        if (cancelled) return;
                        if (ev.type === VADEventType.START_OF_SPEECH) {
                            this._speaking = true
                            console.log("Start")
                            this.emit("START_OF_SPEECH");
                        }
                        if (ev.type === VADEventType.END_OF_SPEECH) {
                            this._speaking = false;
                            this.emit("END_OF_SPEECH");
                        }
                    }
                } catch (err) {
                    console.error("VAD stream error:", err);
                }
            };

            const sttLoop = async () => {
                try {
                    for await (const ev of this.sttStream) {
                        if (cancelled) return;
                        switch (ev.type) {
                            case SpeechEventType.FINAL_TRANSCRIPT:
                                this.emit("FINAL_TRANSCRIPT", ev);
                                break
                            case SpeechEventType.END_OF_SPEECH: 
                                this.emit("END_OF_SPEECH_STT");
                                break
                            case SpeechEventType.SPEECH_STARTED:
                                this.emit("START_OF_SPEECH_STT")
                                break
                            case SpeechEventType.INTERIM_TRANSCRIPT:
                                this.emit("INTERIM_TRANSCRIPT", ev)
                        }
                    }
                } catch (err) {
                    console.error("STT stream error:", err);
                }
            };

            await Promise.all([vadLoop(), sttLoop()])
            this.vadStream.close()
            this.sttStream.close()
            resolve()
        });
    }

    async push(frame: AudioFrame) {
        if (this.closed) return;
        this.vadStream.push(frame);
        this.sttStream.push(frame);
    }

    async close() {
        if (this.closed) {
            throw new Error("UserInput already closed")
        }

        this.closed = true
        this._speaking = false;

        if(this.task) {
            await gracefullyCancel(this.task)
        }
    }

    get speaking(): boolean {
        return this._speaking
    }
}