import { Transform, TransformCallback } from 'stream';
import Sox from 'sox-stream';
import OpusScript from 'opusscript';

export class PCMtoOpusConverter extends Transform {
    private encoder: OpusScript;
    private readonly samplesPerFrame: number;
    private readonly bytesPerSample: number = 2;
    private readonly channels: number = 2;

    constructor() {
        super();
        this.encoder = new OpusScript(48000, 2);
        this.samplesPerFrame = 960;
    }

    _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback): void {
        const sox = Sox({
            global: { 'no-dither': true },
            input: {
                rate: 24000,
                bits: 16,
                channels: 1,
                encoding: 'signed-integer',
                endian: 'little',
                type: 'raw'
            },
            output: {
                rate: 48000,
                bits: 16,
                channels: 1,
                encoding: 'signed-integer',
                endian: 'little',
                type: 'raw'
            }
        });

        const resampledChunks: Buffer[] = [];

        sox.on('data', (resampledChunk: Buffer) => {
            resampledChunks.push(resampledChunk);
        });

        sox.on('end', () => {
            const resampledBuffer = Buffer.concat(resampledChunks);
            const bytesPerFrame = this.samplesPerFrame * this.bytesPerSample * this.channels;

            for (let i = 0; i + bytesPerFrame <= resampledBuffer.length; i += bytesPerFrame) {
                const frame = resampledBuffer.subarray(i, i + bytesPerFrame);
                const encoded = this.encoder.encode(frame, this.samplesPerFrame);
                this.push(encoded);
            }

            callback();
        });

        sox.on('error', (err: Error) => callback(err));

        sox.end(chunk);
    }
}
