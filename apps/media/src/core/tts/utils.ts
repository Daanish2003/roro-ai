import { AsyncIterableQueue } from "../../utils/index.js";

export abstract class TTS {
    abstract stream(): TTSStream
}

export class TTSStream implements AsyncIterableIterator<Buffer>{
    protected static readonly FLUSH_SPEECH_SOURCE = Symbol("FLUSH_SPEECH_SOURCE")
    protected input = new AsyncIterableQueue<string | typeof TTSStream.FLUSH_SPEECH_SOURCE>()
    protected output = new AsyncIterableQueue<Buffer>();
    protected closed = false
    tts: TTS

    constructor(tts: TTS){
        this.tts = tts;
    }

    close() {
        this.input.close();
        this.output.close();
        this.closed = true;
    }

    push(text: string) {
        if(this.input.closed) {
            throw new Error("Input is closed")
        }

        if(this.closed) {
            throw new Error("Stream is closed")
        }

        this.input.put(text)
    }

    endInput() {
        if (this.input.closed) {
          throw new Error('Input is closed');
        }
        if (this.closed) {
          throw new Error('Stream is closed');
        }
        this.input.close();
      }

    flush() {
        if (this.input.closed) {
          throw new Error('Input is closed');
        }
        if (this.closed) {
          throw new Error('Stream is closed');
        }
        this.input.put(TTSStream.FLUSH_SPEECH_SOURCE);
      }

    next(): Promise<IteratorResult<Buffer>> {
        return this.output.next();
    }

    [Symbol.asyncIterator]() {
        return this
    }
}