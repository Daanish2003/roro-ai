// audio-format.d.ts

/// <reference types="node" />

declare module 'audio-format' {
    export interface AudioFormat {
      channels?: number;
      sampleRate?: number;
      interleaved?: boolean;
      type?: 
        | 'uint32' 
        | 'uint8' 
        | 'uint8_clamped' 
        | 'uint16' 
        | 'int32' 
        | 'int8' 
        | 'int16' 
        | 'int32' 
        | 'float32' 
        | 'float64' 
        | 'array' 
        | 'arraybuffer' 
        | 'buffer' 
        | 'audiobuffer' 
        | 'ndarray' 
        | 'ndsamples';
      endianness?: 'le' | 'be';
    }
  
    /**
     * Parses a format string into an AudioFormat object.
     * @param str - The format string.
     * @returns The parsed AudioFormat object.
     */
    export function parse(str: string): AudioFormat;
  
    /**
     * Converts an AudioFormat object to a format string.
     * @param format - The format object.
     * @param omit - Format properties to omit.
     * @returns The format string.
     */
    export function stringify(format: AudioFormat, omit?: AudioFormat | string | null): string;
  
    /**
     * Detects the audio format from an object.
     * @param obj - The object to detect the format from.
     * @returns The detected AudioFormat object.
     */
    export function detect(obj: any): AudioFormat;
  
    /**
     * Gets the type of an audio object.
     * @param arg - The object to check.
     * @returns The type as a string.
     */
    export function type(arg: any): AudioFormat['type'];
  }
  