import { OnnxWrapper, SampleRate } from '@roro-ai/node-silero-vad';

export interface IVADOptions {
    threshold: number;
    negativeThreshold: number
    sampleRate: SampleRate;
    min_speech_duration_ms: number;
    max_speech_duration_s: number
    min_silence_duration_ms: number;
    speech_pad_ms: number;
    forceCPU: boolean
}

export const IVADDefaultOptions: IVADOptions =  {
    threshold: 0.5,
    negativeThreshold: 0.5 - 0.15,
    sampleRate: 16000,
    min_speech_duration_ms: 250,
    max_speech_duration_s: 60,
    min_silence_duration_ms: 100,
    speech_pad_ms: 30,
    forceCPU: true,
}


class VADStream {
    model: OnnxWrapper
    opts: IVADOptions
    inputSampleRate
    constructor(model: OnnxWrapper, opts: IVADOptions) {
        this.model = model
        this.opts = opts
    }

    write(data: ArrayBuffer) {
        const inferenceData = new Float32Array(data)
    }
}