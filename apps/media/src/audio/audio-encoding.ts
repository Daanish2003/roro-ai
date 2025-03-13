import { OpusDecoderWebWorker } from "opus-decoder"

export const decoder = new OpusDecoderWebWorker({
  sampleRate: 16000,
  channels: 2,
  streamCount: 1,
  coupledStreamCount: 1,
  forceStereo: false,
  channelMappingTable: [0, 1],
})


export const opusDecoder = async (opusFrame: Buffer) => {
  const audio = await decoder.decodeFrame(opusFrame);

  const fdata = audio.channelData[0]!

  const int16Data = new Int16Array(fdata.length);
  for (let i = 0; i < fdata.length; i++) {
    int16Data[i] = Math.max(-32768, Math.min(32767, fdata[i]! * 32768));
  }

  return int16Data.buffer
}