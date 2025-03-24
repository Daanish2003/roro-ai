import { AsyncIterableQueue } from "../../utils/index.js";

export abstract class TTS {
    abstract stream(): TTSStream
}

export class TTSStream implements AsyncIterableIterator<Buffer>{
    protected output = new AsyncIterableQueue<Buffer>();
    protected closed = false
    tts: TTS

    constructor(tts: TTS){
        this.tts = tts;
    }

    close() {
        this.output.close();
        this.closed = true;
    }

    next(): Promise<IteratorResult<Buffer>> {
        return this.output.next();
    }

    [Symbol.asyncIterator]() {
        return this
    }
}