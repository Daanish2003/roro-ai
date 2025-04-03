import { AudioFrame } from "../core/audio/audio-frame.js";
import { EventEmitter, once } from "node:events"

export type AudioBuffer = AudioFrame[] | AudioFrame;

export class Future {
    _await: Promise<void>;
    _resolvePromise!: () => void;
    _rejectPromise!: (error: Error) => void
    _done: boolean = false

    constructor() {
        this._await = new Promise<void>((resolve, reject) => {
            this._resolvePromise = resolve;
            this._rejectPromise = reject;
        })
    }

    get await() {
        return this._await
    }

    get done() {
        return this._done
    }

    resolve() {
        this._done = true;
        this._resolvePromise()
    }

    reject(error: Error) {
        this._done = true;
        this._rejectPromise(error)
    }
}

export const mergeFrames = (buffer: AudioBuffer): AudioFrame => {
    if(Array.isArray(buffer)) {
        buffer = buffer as AudioFrame[]
        if(buffer.length == 0) {
            throw new TypeError('buffer is empty')
        }

        const sampleRate = buffer[0]!.sampleRate
        const channels = buffer[0]!.channels
        let samplesPerChannel = 0;
        let data = new Int16Array();

        for (const frame of buffer) {
            if (frame.sampleRate !== sampleRate) {
              throw new TypeError('sample rate mismatch');
            }
      
            if (frame.channels !== channels) {
              throw new TypeError('channel count mismatch');
            }
      
            data = new Int16Array([...data, ...frame.data]);
            samplesPerChannel += frame.samplesPerChannel;
          }

          return new AudioFrame(data, sampleRate, channels, samplesPerChannel);
    }

    return buffer
}

export class Queue<T> {
    items: T[] = []
    limit?: number
    events = new EventEmitter();


    constructor(limit?: number) {
        this.limit = limit
    }

    async get(): Promise<T> {
        const _get = async(): Promise<T> => {
            if(this.items.length === 0) {
                await once(this.events, 'put');
            }
            let item = this.items.shift()
            if(!item) {
                item = await _get()
            }

            return item
        };

        const item = _get()
        this.events.emit('get')
        return item;
    }

    async put(item: T) {
        if(this.limit && this.items.length >= this.limit) {
            await once(this.events, 'get')
        }
        this.items.push(item)
        this.events.emit('put')
    }
}


export class AsyncIterableQueue<T> implements AsyncIterableIterator<T> {
    private static readonly CLOSE_SENTINEL = Symbol('CLOSE_SENTINEL')
    queue = new Queue<T | typeof AsyncIterableQueue.CLOSE_SENTINEL>();
    _closed = false

    get closed(): boolean {
        return this._closed;
    }

    put(item: T): void {
        if (this.closed) {
            throw new Error('Queue is closed')
        }
        
        this.queue.put(item)
    }

    close(): void {
        this._closed = true;
        this.queue.put(AsyncIterableQueue.CLOSE_SENTINEL);
    }

    async next(): Promise<IteratorResult<T>> {
        if(this._closed && this.queue.items.length === 0) {
            return { value: undefined, done: true}
        }

        const item = await this.queue.get();
        if(item === AsyncIterableQueue.CLOSE_SENTINEL && this._closed) {
            return { value: undefined, done: true}
        }

        return { value: item as T, done: false}
    }

    [Symbol.asyncIterator](): AsyncIterableQueue<T> {
        return this
    }

}

export class ExpFilter {
    #alpha: number;
    #max?: number;
    #filtered?: number = undefined;
  
    constructor(alpha: number, max?: number) {
      this.#alpha = alpha;
      this.#max = max;
    }
  
    reset(alpha?: number) {
      if (alpha) {
        this.#alpha = alpha;
      }
      this.#filtered = undefined;
    }
  
    apply(exp: number, sample: number): number {
      if (this.#filtered) {
        const a = this.#alpha ** exp;
        this.#filtered = a * this.#filtered + (1 - a) * sample;
      } else {
        this.#filtered = sample;
      }
  
      if (this.#max && this.#filtered > this.#max) {
        this.#filtered = this.#max;
      }
  
      return this.#filtered;
    }
  
    get filtered(): number | undefined {
      return this.#filtered;
    }
  
    set alpha(alpha: number) {
      this.#alpha = alpha;
    }
  }
  
  export class AudioEnergyFilter {
    #cooldownSeconds: number;
    #cooldown: number;
  
    constructor(cooldownSeconds = 1) {
      this.#cooldownSeconds = cooldownSeconds;
      this.#cooldown = cooldownSeconds;
    }
  
    pushFrame(frame: AudioFrame): boolean {
      const arr = Float32Array.from(frame.data, (x) => x / 32768);
      const rms = (arr.map((x) => x ** 2).reduce((acc, x) => acc + x) / arr.length) ** 0.5;
      if (rms > 0.004) {
        this.#cooldown = this.#cooldownSeconds;
        return true;
      }
  
      const durationSeconds = frame.samplesPerChannel / frame.sampleRate;
      this.#cooldown -= durationSeconds;
      if (this.#cooldown > 0) {
        return true;
      }
  
      return false;
    }
  }