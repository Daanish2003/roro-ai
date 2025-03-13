import { InferenceSession } from "onnxruntime-node";

type SampleRate = 8000 | 16000

export interface VADOptions {
    minSpeechDuration: number;
    minSilenceDuration: number;
    prefixPaddingDuration: number;
    maxBufferedSpeech: number;
    activationThreshold: number;
    sampleRate: SampleRate;
    forceCPU: boolean;
}

const defaultVADOptions: VADOptions = {
    minSpeechDuration: 50,
    minSilenceDuration: 250,
    prefixPaddingDuration: 500,
    maxBufferedSpeech: 60000,
    activationThreshold: 0.5,
    sampleRate: 16000,
    forceCPU: true,
  };

class VADIterator{
    
}