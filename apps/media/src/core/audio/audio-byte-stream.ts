import { AudioFrame } from "./audio-frame.js";

export class AudioByteStream {
    sampleRate: number;
    numChannels: number;
    bytesPerFrame: number;
    buffer: Int8Array;

    constructor(sampleRate: number, numChannels: number, samplesPerChannel: number) {
        this.sampleRate = sampleRate
        this.numChannels = numChannels

        if(samplesPerChannel === null) {
            samplesPerChannel = Math.floor(sampleRate / 50);
        }

        this.bytesPerFrame = numChannels * samplesPerChannel * 2
        this.buffer = new Int8Array();
    }


    write(data: ArrayBuffer): AudioFrame[] {
        this.buffer = new Int8Array([...this.buffer, ...new Int8Array(data)])

        const frames: AudioFrame[] = []

        while (this.buffer.length >= this.bytesPerFrame) {
            const frameData = this.buffer.slice(0, this.bytesPerFrame)
            this.buffer = this.buffer.slice(this.bytesPerFrame);

            frames.push(
                new AudioFrame(
                    new Int16Array(frameData.buffer),
                    this.sampleRate,
                    this.numChannels,
                    frameData.length / 2
                )
            )
        }

        return frames
    }

    flush(): AudioFrame[] {
        if (this.buffer.length % (2 * this.numChannels) !== 0) {
            console.warn('AudioByteStream: incomplete frame during flush, dropping');
            return [];
        }

        return [
            new AudioFrame(
              new Int16Array(this.buffer.buffer),
              this.sampleRate,
              this.numChannels,
              this.buffer.length / 2,
            ),
          ];

    }


}