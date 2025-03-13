/// <reference types="node" />

declare module 'pcm-convert' {
    export type FormatType =
      | 'uint8'
      | 'uint8_clamped'
      | 'uint16'
      | 'uint32'
      | 'int8'
      | 'int16'
      | 'int32'
      | 'float32'
      | 'float64'
      | 'array'
      | 'arraybuffer'
      | 'buffer'
      | 'audiobuffer'
      | 'ndsamples'
      | 'ndarray';
  
    export interface Format {
      type?: FormatType;
      dtype?: FormatType;
      channels?: number;
      interleaved?: boolean;
      endianness?: 'le' | 'be';
      min?: number;
      max?: number;
    }
  
    /**
     * Convert PCM data between different formats.
     * 
     * @param buffer - The input buffer to convert.
     * @param from - The format of the input buffer.
     * @param to - The target format to convert to.
     * @param target - Optional target buffer to store the converted data.
     * @returns The converted buffer.
     */
    function convert(
      buffer: Buffer | ArrayBuffer | number[] | Float32Array | Int16Array | Uint8Array,
      from: string | Format,
      to?: string | Format,
      target?: Buffer | ArrayBuffer | number[] | Float32Array | Int16Array | Uint8Array
    ): Buffer | ArrayBuffer | number[] | Float32Array | Int16Array | Uint8Array;
  
    export default convert;
  }
  