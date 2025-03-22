export function toArrayBuffer(buffer: Buffer) {
    const arrayBuffer = new ArrayBuffer(buffer.length)
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i]!
    }

    return arrayBuffer
}

export function toBuffer(arrayBuffer: ArrayBuffer) {
    const buffer = Buffer.alloc(arrayBuffer.byteLength);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i ) {
        buffer[i] = view[i]!
    }

    return buffer
}

export const normalizeAudio = (input: Float32Array) => {
    const maxAmplitude = Math.max(...input.map(Math.abs));
    if (maxAmplitude > 0) {
      return input.map((sample) => sample / maxAmplitude);
    }
    return input;
};

export function bytesToLinear16(bytes: Uint8Array) {
    if (bytes.length % 2 !== 0) {
      throw new Error("Byte array length must be even for 16-bit PCM.");
    }
  
    const samples = new Int16Array(bytes.length / 2); // Create Int16Array
  
    for (let i = 0; i < samples.length; i++) {
      const lowByte = bytes[i * 2];
      const highByte = bytes[i * 2 + 1];
      samples[i] = (highByte! << 8) | lowByte!; // Combine bytes (little-endian)
    }
  
    return samples;
}

export function resamplerCubic(input: Float32Array, targetFrameSize: number): Float32Array {
  const output = new Float32Array(targetFrameSize)
  const ratio = (input.length - 1) / (targetFrameSize - 1)

  for (let i = 0; i < targetFrameSize; i++) {
    const index = i * ratio
    const x = Math.floor(index)
    const t = index - x

    const x0 = Math.max(x - 1, 0)
    const x1 = x
    const x2 = Math.min(x + 1, input.length - 1)
    const x3 = Math.min(x + 2, input.length - 1)

    const p0 = input[x0]!
    const p1 = input[x1]!
    const p2 = input[x2]!
    const p3 = input[x3]!

    output[i] =
      p1 +
      0.5 *
        t *
        (p2 - p0 +
          t * (2 * p0 - 5 * p1 + 4 * p2 - p3 +
          t * (3 * (p1 - p2) + p3 - p0)))

  }

  return output
}

export function applyGain(audioData: Float32Array, gainFactor = 1.05) {
  return Float32Array.from(audioData.map(sample => sample * gainFactor));
}
