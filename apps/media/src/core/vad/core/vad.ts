import { InferenceSession } from "onnxruntime-node";
import { newInferenceSession, SampleRate, SileroVADOnnx } from "./model.js";
import { ExpFilter } from "../../../utils/index.js";
import { AudioFloatStream } from "../../audio/audio-float-stream.js";
import { InferenceFrame } from "../../audio/inference-frame.js";


export interface VADOptions {
    minSpeechDuration: number;
    minSilenceDuration: number;
    prefixPaddingDuration: number;
    activationThreshold: number;
    sampleRate: SampleRate;
    forceCPU: boolean;
  }
  
  const defaultVADOptions: VADOptions = {
    minSpeechDuration: 50,
    minSilenceDuration: 250,
    prefixPaddingDuration: 500,
    activationThreshold: 0.5,
    sampleRate: 16000,
    forceCPU: true,
  };

export class VAD {
    _opts: VADOptions
    _session: InferenceSession
    _model: SileroVADOnnx
    _stream: AudioFloatStream
    _expFilter: ExpFilter

    constructor(session: InferenceSession, opts: VADOptions) {
        this._session = session;
        this._opts = opts
        this._model = new SileroVADOnnx(this._session)
        this._stream = new AudioFloatStream(16000, 1, 512)
        this._expFilter = new ExpFilter(0.35)
    }

    static async load(opts: Partial<VADOptions> = {}) {
        const mergedOptions = {...defaultVADOptions, ...opts}
        const session = await newInferenceSession(mergedOptions.forceCPU)
        return new VAD(session, mergedOptions)
    }

    async sendAudio(data: ArrayBuffer) {
      const frames = this._stream.write(data)

      console.log(frames)

      // for await(const frame of frames) {
      //   const p = await this.getSpeechProb(frame)
      //   console.log(p)
      // }
    }

    async getSpeechProb(frame: InferenceFrame) {
      const data = await this._model.run(frame.data)
      console.log(data)
      return this._expFilter.apply(1, data);
    }
}

