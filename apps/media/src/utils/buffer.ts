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

