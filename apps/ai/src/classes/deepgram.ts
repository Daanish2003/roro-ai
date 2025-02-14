import { createClient, type ListenLiveClient, LiveTranscriptionEvents, LiveTTSEvents } from "@deepgram/sdk";
import "dotenv/config";
import { GroqModal } from "./groq-modal.js";
import { Producer } from "mediasoup/node/lib/types.js";
import { Readable, Transform } from "stream";
import * as RTPParser from 'rtp-parser';
import { packets } from "rtp.js"
import OpusScript from "opusscript";

const OPUS_FRAME_SAMPLES = 960;
const CHANNELS = 2;
const BYTES_PER_SAMPLE = 2;
const FRAME_BYTE_SIZE = OPUS_FRAME_SAMPLES * CHANNELS * BYTES_PER_SAMPLE;

class OpusBufferingTransform extends Transform {
  private buffer: Buffer = Buffer.alloc(0);
  constructor(private encoder: OpusScript) {
    super();
  }
  _transform(chunk: Buffer, encoding: BufferEncoding, callback: Function) {
    // Append new incoming data to our buffer.
    this.buffer = Buffer.concat([this.buffer, chunk]);
    // While we have enough data for a full frame, encode one frame.
    while (this.buffer.length >= FRAME_BYTE_SIZE) {
      const frame = this.buffer.slice(0, FRAME_BYTE_SIZE);
      this.buffer = this.buffer.slice(FRAME_BYTE_SIZE);
      try {
        const encoded = this.encoder.encode(frame, OPUS_FRAME_SAMPLES);
        this.push(encoded);
      } catch (err) {
        return callback(err);
      }
    }
    callback();
  }
  _flush(callback: Function) {
    // Optionally: you can decide to pad or simply discard incomplete data.
    callback();
  }
}

export class DeepgramSTT {
  private deepgram: ReturnType<typeof createClient>;
  private connection: ListenLiveClient | null = null;
  private keepAliveInterval: NodeJS.Timeout | null = null;
  private directTransportProducer: Producer | null = null;

  private rtpSequenceNumber: number = 0;
  private rtpTimestamp: number = 0;
  private rtpSSRC: number = 0; 

  constructor(private groqModal: GroqModal) {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      throw new Error("Deepgram API key is missing.");
    }
    this.deepgram = createClient(apiKey);
  }

  public createConnection(): ListenLiveClient {
    if (this.connection) {
      return this.connection;
    }

    this.connection = this.deepgram.listen.live({
      model: "nova-3",
      punctuate: true,
      smart_format: true,
      interim_results: true,
      channels: 2,
      encoding: "opus",
      sample_rate: 48000,
      filler_words: false,
      language: "en-US",
      vad_events: true,
      utterance_end_ms: 3000,
      endpointing: 3000,
      no_delay: true,
      profanity_filter: false,
    });

    this.setupEventListeners();
    return this.connection;
  }

  private setupEventListeners(): void {
    if (!this.connection) return;

    this.connection.on(LiveTranscriptionEvents.Open, () => {
      console.log("Deepgram connected");
      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval);
      }
      this.keepAliveInterval = setInterval(() => {
        this.connection?.keepAlive();
      }, 3000);
    });

    this.connection.on(LiveTranscriptionEvents.Transcript, async (data) => {
      if (data.channel && data.channel.alternatives.length > 0) {
        const transcript = data.channel.alternatives[0].transcript;
        if (data.is_final && transcript.trim().length > 0) {
          console.log("Transcript", transcript);
          const response = await this.groqModal.sendMessage(transcript);

          await this.textToSpeech(response)
        }
      }
    });

    this.connection.on(LiveTranscriptionEvents.Metadata, (data) => {
      console.log("Metadata:", data);
    });

    this.connection.on(LiveTranscriptionEvents.Error, (err) => {
      console.error("Deepgram Error:", err);
    });

    this.connection.on(LiveTranscriptionEvents.Close, () => {
      console.log("Connection closed");
      this.cleanupConnection();
    });
  }

  public sendAudio(audioBuffer: Buffer): void {
    if (!this.connection) {
      console.warn("No active connection to send audio.");
      return;
    }
    this.connection.send(audioBuffer);
  }

  public closeConnection(): void {
    if (this.connection) {
      this.connection.requestClose();
      this.connection = null;
    }
    this.cleanupConnection();
  }

  public async textToSpeech(text:string) {
    try {
      const dgConnection = this.deepgram.speak.live(
        { 
          model: "aura-asteria-en" ,
          container: 'none',
          sample_rate: 48000,
        });

        let audioBuffer = Buffer.alloc(0);

        dgConnection.on(LiveTTSEvents.Open, () => {
          console.log("Connection opened");
    
          // Send text data for TTS synthesis
          dgConnection.sendText(text);
          dgConnection.flush();
        });

        dgConnection.on(LiveTTSEvents.Audio, (data) => {
          console.log("Deepgram audio data received");
          const buffer = Buffer.from(data);
          audioBuffer = Buffer.concat([audioBuffer, buffer]);
        });
    
        dgConnection.on(LiveTTSEvents.Flushed, () => {
          console.log("Deepgram Flushed - Writing audio file");
          this.convertAndStream(audioBuffer);
        });

        dgConnection.on(LiveTTSEvents.Close, () => {
          console.log("Connection closed");
        });
    
        dgConnection.on(LiveTTSEvents.Error, (err) => {
          console.error("Deepgram TTS Error:", err);
        });
    } catch (error) {
        console.log("Error send to text to speech", error)
    }
  }

  public setDirectTransportProducer(directTransportProducer: Producer) {
      this.directTransportProducer = directTransportProducer
      const ssrc = directTransportProducer.rtpParameters.encodings?.[0]?.ssrc;
      if (ssrc === undefined) {
          throw new Error("SSRC is undefined");
       }
       this.rtpSSRC = ssrc;

  }

  private convertAndStream(audioBuffer: Buffer) {
    try {
      // Create a readable stream from the PCM audio buffer
      const pcmStream = Readable.from(audioBuffer);

      // Upmix mono PCM to stereo (assuming input PCM is 16-bit little-endian)
      const upmixTransform = new Transform({
        transform(chunk, encoding, callback) {
          const numSamples = chunk.length / 2;
          const stereoBuffer = Buffer.alloc(chunk.length * 2);
          for (let i = 0; i < numSamples; i++) {
            const sample = chunk.readInt16LE(i * 2);
            stereoBuffer.writeInt16LE(sample, i * 4);       // Left channel
            stereoBuffer.writeInt16LE(sample, i * 4 + 2);     // Right channel
          }
          callback(null, stereoBuffer);
        },
      });

      // Encode PCM (stereo, 16-bit LE, 48000Hz) to Opus using opusscript.
      const opusEncoder = new OpusScript(48000, 2, OpusScript.Application.AUDIO);
      const bufferingOpusTransform = new OpusBufferingTransform(opusEncoder);

      // Transform to encapsulate each Opus chunk in an RTP packet using rtp.js.
      const rtpPacketTransform = new Transform({
        transform: (chunk: Buffer, encoding, callback) => {
          try {
            // Create RTP packet from the Opus-encoded chunk.
            const rtpPacketBuffer = this.createRtpPacket(chunk);

            new Promise((resolve) => setTimeout(resolve, 30));
            
            callback(null, rtpPacketBuffer);
          } catch (err) {
            callback(err as Error);
          }
        },
      });

      // Build the pipeline:
      // PCM -> Upmix -> Opus encode -> RTP packetize -> send via directTransportProducer
      pcmStream
        .pipe(upmixTransform)
        .pipe(bufferingOpusTransform)
        .pipe(rtpPacketTransform)
        .on("data", async (rtpPacketBuffer: Buffer) => {
          if (this.directTransportProducer) {
            console.log("Sending RTP packet, length:", rtpPacketBuffer.length);
            await new Promise((resolve) => setTimeout(resolve, 30));
            this.directTransportProducer.send(rtpPacketBuffer);
          } else {
            console.error("directTransportProducer is not set");
          }
        });

    } catch (error) {
      console.error("Error in PCM to Opus streaming:", error);
    }
  }

  private createRtpPacket(opusPayload: Buffer): Buffer {
    const { RtpPacket } = packets;
    const rtpPacket = new RtpPacket();

    // Set RTP header fields using the provided setter methods.
    rtpPacket.setPayloadType(100); // dynamic payload type, adjust as needed
    rtpPacket.setSequenceNumber(this.rtpSequenceNumber++);
    rtpPacket.setTimestamp(this.rtpTimestamp);
    // Increment timestamp by 960 samples per packet (for 20ms at 48000Hz)
    this.rtpTimestamp += 960;
    rtpPacket.setSsrc(this.rtpSSRC);

    // Create a DataView from the opusPayload buffer.
    const payloadDataView = new DataView(opusPayload.buffer, opusPayload.byteOffset, opusPayload.byteLength);
    rtpPacket.setPayload(payloadDataView);

    // Allocate an ArrayBuffer for serialization.
    const packetLength = rtpPacket.getByteLength();
    const arrayBuffer = new ArrayBuffer(packetLength);
    rtpPacket.serialize(arrayBuffer);
    return Buffer.from(arrayBuffer);
  }

  private cleanupConnection(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
    this.connection = null;
  }
}
