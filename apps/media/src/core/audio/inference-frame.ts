export class InferenceFrame {
    data: Float32Array;
    sampleRate: number;
    channels: number;
    samplesPerChannel: number;
  
      constructor(data: Float32Array, sampleRate: number, channels: number, samplesPerChannel: number) {
          this.data = data
          this.sampleRate = sampleRate;
          this.channels = channels;
          this.samplesPerChannel = samplesPerChannel
      }
  
      static create(sampleRate: number, channels: number, samplesPerChannel: number): InferenceFrame {
          const data = new Float32Array(channels * samplesPerChannel)
          return new InferenceFrame(data, sampleRate, channels, samplesPerChannel)
      }
  }