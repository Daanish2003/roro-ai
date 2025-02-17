declare module 'node-vad' {
    export enum Mode {
      NORMAL = 0,
      LOW_BITRATE = 1,
      AGGRESSIVE = 2,
      VERY_AGGRESSIVE = 3,
    }
    export enum Event {
      ERROR = -1,
      SILENCE = 0,
      VOICE = 1,
      NOISE = 2,
    }
    export default class VAD {
      constructor(mode?: Mode);
      processAudio(buffer: Buffer, sampleRate: number): Promise<Event>;
    }
}