import { SpeechEventType } from "../../utils/event.js"
import { AsyncIterableQueue } from "../../utils/index.js"
import { AudioFrame } from "../audio/audio-frame.js"

export interface SpeechData {
    language: string;
    text: string;
    startTime: number;
    endTime: number;
    confidence: number;
}

export interface SpeechEvent {
    type: SpeechEventType;
    transcript: string
  }

export abstract class STT {
    abstract stream(): STTStream
}

export abstract class STTStream implements AsyncIterableIterator<SpeechEvent> {
    protected static readonly FLUSH_TRANSCRIPT = Symbol('FLUSH_TRANSCRIPT')
    protected input = new AsyncIterableQueue<AudioFrame | typeof STTStream.FLUSH_TRANSCRIPT>()
    protected output = new AsyncIterableQueue<SpeechEvent>();
    stt: STT
    closed = false

    constructor(stt: STT) {
        this.stt = stt
    }


    push(frame: AudioFrame) {
        if (this.input.closed) {
            throw new Error("Input is closed")
        }

        if(this.closed) {
            throw new Error('Stream is closed')
        }

        this.input.put(frame)
    }

    flush() {
        if (this.input.closed) {
            throw new Error("Input is closed")
        }

        if(this.closed) {
            throw new Error('Stream is closed')
        }

        this.input.put(STTStream.FLUSH_TRANSCRIPT)
    }

    endInput() {
        if (this.input.closed) {
            throw new Error("Input is closed")
        }

        if(this.closed) {
            throw new Error('Stream is closed')
        }

        this.input.close()
    }

    close() {
        this.input.close()
        this.output.close()
        this.closed = true
    }

    async next(): Promise<IteratorResult<SpeechEvent>> {
        return this.output.next()
    }

    [Symbol.asyncIterator]() {
        return this
    }
}