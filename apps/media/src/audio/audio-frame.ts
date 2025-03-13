
export class AudioFrame {
  data: Int16Array;
  sampleRate: number;
  channels: number;
  samplesPerChannel: number;

    constructor(data: Int16Array, sampleRate: number, channels: number, samplesPerChannel: number) {
        this.data = data
        this.sampleRate = sampleRate;
        this.channels = channels;
        this.samplesPerChannel = samplesPerChannel
    }

    static create(sampleRate: number, channels: number, samplesPerChannel: number): AudioFrame {
        const data = new Int16Array(channels * samplesPerChannel)
        return new AudioFrame(data, sampleRate, channels, samplesPerChannel)
    }
}