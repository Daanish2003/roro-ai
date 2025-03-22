import { VADEventType } from "../../../utils/event.js";
import { AsyncIterableQueue } from "../../../utils/index.js";
import { AudioFrame } from "../../audio/audio-frame.js";

export interface VADEvent {
    type: VADEventType,
}


export abstract class VAD {
    abstract stream(): VADStream
}


export abstract class VADStream implements AsyncIterableIterator<VADEvent> {
    protected static readonly FLUSH_STREAM = Symbol('FLUSH_STREAM')
    protected input = new AsyncIterableQueue<AudioFrame | typeof VADStream.FLUSH_STREAM>();
    protected output = new AsyncIterableQueue<VADEvent>();
    protected closed = false;
    vad: VAD

    constructor(vad: VAD) {
        this.vad = vad
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

        this.input.put(VADStream.FLUSH_STREAM)
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

    async next(): Promise<IteratorResult<VADEvent>> {
        return this.output.next()
    }

    [Symbol.asyncIterator](): VADStream {
        return this
    }

}