import { AudioFrame } from "../audio-frame.js"
import { AsyncIterableQueue } from "../../../utils/index.js";

export abstract class Audio {
  abstract stream(): AudioStream
}

export abstract class AudioStream implements AsyncIterableIterator<AudioFrame>{
    protected static readonly FLUSH_AUDIO = Symbol('FLUSH_AUDIO');
    protected input = new AsyncIterableQueue<Buffer | typeof AudioStream.FLUSH_AUDIO>()
    protected output =  new AsyncIterableQueue<AudioFrame>()
    closed = false;
    audio: Audio
    constructor(audio: Audio){
      this.audio = audio
    }

    pushStream(stream: Buffer) {
        if(this.input.closed) {
            throw new Error("Input is closed")
        }

        if(this.closed) {
            throw new Error("Stream is closed")
        }

        this.input.put(stream)
    }

    flush() {
        if (this.input.closed) {
          throw new Error('Input is closed');
        }
        if (this.closed) {
          throw new Error('Stream is closed');
        }
        this.input.put(AudioStream.FLUSH_AUDIO);
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

    close() {
      this.input.close();
      this.output.close()
      this.closed = true
    }

    async next() {
        return this.output.next()
    }

    [Symbol.asyncIterator]() {
        return this
    }

}