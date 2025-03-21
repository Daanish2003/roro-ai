import { InferenceSession, Tensor } from 'onnxruntime-node'

export type SampleRate = 16000

export function newInferenceSession(forceCPU:boolean = true) {  
    return InferenceSession.create(new URL('silero_vad.onnx', import.meta.url).pathname, {
        interOpNumThreads: 1,
        intraOpNumThreads: 1,
        executionMode: 'sequential',
        executionProviders: forceCPU ? [{ name: 'cpu'}]: undefined
    })
}

export class SileroVADOnnx {
    _session :InferenceSession;
    _sampleRate: SampleRate;
    _windowSizeSamples: number;
    _contextSize: number;
    _sampleRateNd: BigInt64Array;
    _context: Float32Array;
    _rnnState: Float32Array;
    _inputBuffer: Float32Array;

    constructor(session: InferenceSession) {
        this._session = session
        this._sampleRate = 16000
        this._windowSizeSamples = 512
        this._contextSize = 64
        this._sampleRateNd = BigInt64Array.from([BigInt(this._sampleRate)])
        this._context = new Float32Array(this._contextSize);
        this._rnnState = new Float32Array(2 * 1 * 128)
        this._inputBuffer = new Float32Array(this._contextSize + this._windowSizeSamples)
    }

    get windowSizeSamples() {
        return this._windowSizeSamples
    }

    async run(frame: Float32Array) {
        this._inputBuffer.set(this._context, 0);
        this._inputBuffer.set(frame, this._contextSize)

        return await this._session.run({
            input: new Tensor('float32', this._inputBuffer, [
                1,
                this._contextSize + this._windowSizeSamples
            ]),
            state: new Tensor('float32', this._rnnState, [2, 1, 128]),
            sr: new Tensor('int64', this._sampleRateNd)
        }).then((result) => {
            this._context = this._inputBuffer.subarray(0, this._contextSize);
            return (result.output!.data as Float32Array).at(0)!
        })
    }
}

