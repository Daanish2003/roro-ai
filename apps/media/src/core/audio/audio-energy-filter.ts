import { AudioFrame } from "./audio-frame.js";

export class AudioEnergyFilter {
    #cooldownSeconds: number;
    #cooldown: number;
  
    constructor(cooldownSeconds = 1) {
      this.#cooldownSeconds = cooldownSeconds;
      this.#cooldown = cooldownSeconds;
    }
  
    pushFrame(frame: AudioFrame): boolean {
      const arr = Float32Array.from(frame.data, (x) => x / 32768);
      const rms = (arr.map((x) => x ** 2).reduce((acc, x) => acc + x) / arr.length) ** 0.5;
      if (rms > 0.004) {
        this.#cooldown = this.#cooldownSeconds;
        return true;
      }
  
      const durationSeconds = frame.samplesPerChannel / frame.sampleRate;
      this.#cooldown -= durationSeconds;
      if (this.#cooldown > 0) {
        return true;
      }
  
      return false;
    }
  }