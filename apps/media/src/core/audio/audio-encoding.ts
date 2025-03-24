import OpusScript from "opusscript"

const samplingRate = 48000
const frameDuration = 20
const channels = 2

const encoder = new OpusScript(samplingRate, channels, OpusScript.Application.AUDIO);

const frameSize = samplingRate * frameDuration / 1000;

export function OpusEncoder(data: Buffer) {
  const encodedPacket = encoder.encode(data, frameSize)

  return encodedPacket
}