import { InferenceSession } from "onnxruntime-node";
import { newInferenceSession, SampleRate, SileroVADOnnx } from "./model.js";
import { VADStream as BaseStream } from "./utils.js";
import { AudioFrame } from "../../audio/audio-frame.js";
import { ExpFilter, mergeFrames } from "../../../utils/index.js";
import { VADEventType } from "../../../utils/event.js";


export interface VADOptions {
    minSpeechDuration: number;
    minSilenceDuration: number;
    activationThreshold: number;
    sampleRate: SampleRate;
    forceCPU: boolean;
  }
  
  const defaultVADOptions: VADOptions = {
    minSpeechDuration: 150,
    minSilenceDuration: 500,
    activationThreshold: 0.5,
    sampleRate: 16000,
    forceCPU: true,
  };

export class VAD {
    _opts: VADOptions
    _session: InferenceSession
    _streams: VADStream[] = []

    constructor(session: InferenceSession, opts: VADOptions) {
        this._session = session;
        this._opts = opts
    }

    static async load(opts: Partial<VADOptions> = {}) {
        const mergedOptions = {...defaultVADOptions, ...opts}
        const session = await newInferenceSession(mergedOptions.forceCPU)
        return new VAD(session, mergedOptions)
    }

    stream() {
      const stream = new VADStream(
        this,
        this._opts,
        new SileroVADOnnx(this._session)
      )

      this._streams.push(stream)

      return stream
    }
}

export class VADStream extends BaseStream {
  private options: VADOptions
  private model: SileroVADOnnx
  private task: Promise<void>
  private expFilter = new ExpFilter(0.35) 

  constructor(vad: VAD, opts: VADOptions, model: SileroVADOnnx) {
    super(vad)
    this.options = opts
    this.model = model
    this.task = this.run()
  }

  private async run() {
    let inferenceData = new Float32Array(this.model.windowSizeSamples)
    let inferenceFrames: AudioFrame[] = []
    let pubSpeaking:boolean = false;
    let speechThresholdDuration = 0;
    let silenceThresholdDuration = 0;
    for await (const frame of this.input) {
      if (typeof frame === 'symbol') {
        continue;
      }

      inferenceFrames.push(frame)

      while(true) {
        const availableInferenceSamples = inferenceFrames
            .map((x) => x.samplesPerChannel)
            .reduce((acc, x) => acc + x, 0);

        if (availableInferenceSamples < this.model.windowSizeSamples) {
          break;
        }

        const inferenceFrame = mergeFrames(inferenceFrames);

        inferenceData = Float32Array.from(
          inferenceFrame.data.subarray(0, this.model.windowSizeSamples),
          (x) => x / 32767
        )

        const p = await this.model
            .run(inferenceData)
            .then((data) => this.expFilter.apply(1, data));

        const windowDuration = (this.model.windowSizeSamples / this.options.sampleRate) * 1000

        if(p > this.options.activationThreshold) {
          speechThresholdDuration += windowDuration;
          if(!pubSpeaking && (speechThresholdDuration >= this.options.minSpeechDuration)) {
            pubSpeaking = true
            this.output.put({
              type: VADEventType.START_OF_SPEECH
            })
            silenceThresholdDuration = 0;
          }
        } else {
          silenceThresholdDuration += windowDuration
          if(pubSpeaking && (silenceThresholdDuration > this.options.minSilenceDuration)) {
            pubSpeaking = false
            this.output.put({
              type: VADEventType.END_OF_SPEECH
            })
            speechThresholdDuration = 0
          }
        }
        inferenceFrames = []
      }
    }
  }
}

