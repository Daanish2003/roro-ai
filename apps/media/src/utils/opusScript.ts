import OpusScript from "opusscript"

const samplingRate = 48000
const frameDuration = 20
const channels = 2

const frameSize = samplingRate * frameDuration / 1000

export const encoder = new OpusScript(samplingRate, channels, OpusScript.Application.AUDIO)

export const decodedPackets = (encodedPackets: Buffer) => {
   const decoded = encoder.decode(encodedPackets);
   
   return decoded;
};

