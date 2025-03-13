import * as ort from "onnxruntime-node"

export type SampleRate = 8000 | 16000;

export class OnnxWrapper {
    private _session?: ort.InferenceSession;
    private _sampleRate: number;
    private _state: Float32Array;
    private _context: Float32Array;
    private _lastSampleRate: BigInt64Array;
    private _contextSize: number;
    private _windowSampleSize: number;
    private _inputBuffer: Float32Array

    constructor(path: string, forceCPU: boolean, sampleRate: SampleRate) {
        this._sampleRate = sampleRate;
        ort.InferenceSession.create(
            path,
            {
                interOpNumThreads: 1,
                intraOpNumThreads: 1,
                executionMode: 'sequential',
                executionProviders: forceCPU ? [{ name: 'cpu' }] : undefined
            }
        ).then((session) => {
            this._session = session;
            console.log("ONNX model loaded successfully")
        });

        switch (sampleRate) {
            case 8000:
                this._windowSampleSize = 256;
                this._contextSize = 32;
                break
            case 16000:
                this._windowSampleSize = 512;
                this._contextSize = 64;
                break
            default:
                throw new Error("sample rate is not supported")
        };

        this._lastSampleRate = BigInt64Array.from([BigInt(sampleRate)])
        this._state = new Float32Array(2 * 1 * 128)
        this._context = new Float32Array(this._contextSize);
        this._inputBuffer = new Float32Array(this._contextSize + this._windowSampleSize)
    }

    async processAudio(audio: Float32Array, sampleRate: number) {
        this._inputBuffer.set(this._context, 0);
        this._inputBuffer.set(audio, this._context.length);


        const feeds = {
            input: new ort.Tensor('float32', this._inputBuffer, [1, this._contextSize + this._windowSampleSize]),
            state: new ort.Tensor('float32', this._state, [2, 1, 128]),
            sr: new ort.Tensor('int64', new BigInt64Array([BigInt(sampleRate)]))
        }

        if(!this._session) {
            throw new Error("Inference session not found")
        }

        return await this._session.run(feeds).then((results) => {
            this._context = this._inputBuffer.subarray(0, this._contextSize);
            const output = (results.output!.data as Float32Array).at(0)!

            return output > 0.1 ? "speech" : "silence"
        })
    }
}