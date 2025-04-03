import { InferenceFrame } from "./inference-frame.js";

export class AudioFloatStream {
    sampleRate: number;
    numChannels: number;
    samplesPerChannel: number;

    constructor(sampleRate: number, numChannels: number, samplesPerChannel: number) {
        this.sampleRate = sampleRate
        this.numChannels = numChannels
        this.samplesPerChannel = samplesPerChannel ?? Math.floor(sampleRate / 50);
    }


    write(data: ArrayBuffer) {
        let inferenceData = new Float32Array(this.samplesPerChannel)

        const InferenceFrames: InferenceFrame[] = []
    }
}