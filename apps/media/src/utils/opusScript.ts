import OpusScript from "opusscript"

const samplingRate = 48000
const frameDuration = 20
const channels = 2

const frameSize = samplingRate * frameDuration / 1000

export const encoder = new OpusScript(samplingRate, channels, OpusScript.Application.AUDIO)

export const decodedPackets = (endcodedPackets: Buffer) => {
   const decoded = encoder.decode(endcodedPackets);
   const pcm16 = Buffer.alloc(decoded.length * 2)
   for (let i = 0; i < decoded.length; i++) {
      const sample = Math.max(-1, Math.min(1, decoded[i]!))
      pcm16.writeInt16LE(sample * 32767, i * 2);
   }
   return pcm16
}
