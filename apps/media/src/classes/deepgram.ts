import { createClient, type ListenLiveClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import "dotenv/config";
import { GroqModal } from "./groq-modal.js";
import { Producer } from "mediasoup/node/lib/types.js";
import { packets } from "rtp.js"
import prism from "prism-media"
import { Readable } from "stream";
import { JitterBuffer } from "./jitterBuffer.js";



export class DeepgramSTT {
  private deepgram: ReturnType<typeof createClient>;
  private connection: ListenLiveClient | null = null;
  private keepAliveInterval: NodeJS.Timeout | null = null;
  private directTransportProducer: Producer | null = null;
  private jitterBuffer: JitterBuffer | null = null;

  private rtpSequenceNumber: number = 0;
  private rtpTimestamp: number = 0;
  private rtpSSRC: number = 0;

  constructor(private groqModal: GroqModal) {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      throw new Error("Deepgram API key is missing.");
    }
    this.deepgram = createClient(apiKey);
    this.jitterBuffer = new JitterBuffer(20, (packet: Buffer) => {
      this.directTransportProducer?.send(packet);
    });
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
      const response = this.deepgram.speak.request(
        {
          text
        },
        { 
          model: "aura-asteria-en" ,
          encoding: 'opus',
          bit_rate: 24000,
        });

        const stream = await (await response).getStream()

        if(stream) {
          this.processAudio(stream)
        }
    } catch (error) {
        console.log("Error send to text to speech", error)
    }
  }

  private async getAudioBuffer (response: ReadableStream<Uint8Array<ArrayBufferLike>>) {
    const reader = response.getReader();
    const chunks = [];
  
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
  
      chunks.push(value);
    }
  
    const dataArray = chunks.reduce(
      (acc, chunk) => Uint8Array.from([...acc, ...chunk]),
      new Uint8Array(0)
    );
  
    return Buffer.from(dataArray.buffer);
  };

  private async processAudio(response: ReadableStream<Uint8Array>) {
    // Get the complete audio buffer
    const audioBuffer = await this.getAudioBuffer(response);
    
    // Convert the buffer back into a Readable stream
    const audioStream = Readable.from(audioBuffer);
    
    // Create the Ogg demuxer instance from prism-media
    const oggDemuxer = new prism.opus.OggDemuxer();
    
    // Pipe the stream into the demuxer
    audioStream.pipe(oggDemuxer);
    
    // Listen for opus frame data
    oggDemuxer.on("data", (opusFrame: Buffer) => {
      const currentPacketTimestamp = this.rtpTimestamp;
      const rtpPackets = this.createRtpPacket(opusFrame)

      const sequence = this.rtpSequenceNumber - 1;
      this.jitterBuffer?.addPacket(sequence, rtpPackets, currentPacketTimestamp)
    });
    
    oggDemuxer.on("error", (err: Error) => {
      console.error("Ogg demuxer error:", err);
    });
    
    oggDemuxer.on("end", () => {
      console.log("Ogg demuxer ended");
      this.jitterBuffer?.flushAllGradually();
    });
  }


  public setDirectTransportProducer(directTransportProducer: Producer) {
      this.directTransportProducer = directTransportProducer
      const ssrc = directTransportProducer.rtpParameters.encodings?.[0]?.ssrc;
      if (ssrc === undefined) {
          throw new Error("SSRC is undefined");
       }
       this.rtpSSRC = ssrc;

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
    this.jitterBuffer?.stop();
  }
}
