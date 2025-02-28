import { createClient } from "@deepgram/sdk";
import { Readable } from "stream";
import prism from 'prism-media';
import { Producer } from "mediasoup/node/lib/types.js";
import { packets } from "rtp.js";
import { Room } from "./room.js";
import { v4 as uuidv4 } from 'uuid';
import { JitterBuffer } from "./jitterBuffer.js";

export class DeepgramTTS {
    private room: Room
    private deepgramTTS: ReturnType<typeof createClient>;
    private directTransportProducer: Producer | null = null;
    private rtpSequenceNumber: number = 0;
    private rtpTimestamp: number = 0;
    private rtpSSRC: number = 0;

    private currentSessionId: string | null = null;
    private currentJitterBuffer: JitterBuffer | null = null;
    private isAgentSpeaking: boolean = false

    constructor(room: Room) {
        const apiKey = process.env.DEEPGRAM_API_KEY;
        if (!apiKey) {
              throw new Error("Deepgram API key is missing.");
        }
        this.deepgramTTS = createClient(apiKey);
        this.room = room

        this.room.on("LLM_RESPONSE", (response) => {
            this.textToSpeech(response)
        })

        this.room.on("AGENT_START_SPEAKING", () => {
          this.isAgentSpeaking = true
        })

        this.room.on("AGENT_STOP_SPEAKING", () => {
          this.isAgentSpeaking = false
        })
    }

    public async textToSpeech(text: string) {
        if(this.isAgentSpeaking) return
        if(this.currentSessionId !== null) {
          this.endCurrentSession();
        }
        const sessionId = uuidv4();
        console.log(`DeepgramTTS: New session ${sessionId} started.`);
    
        const jitterBuffer = new JitterBuffer(this.room, 20, (packet: Buffer) => {
          this.directTransportProducer?.send(packet);
        });

        this.currentJitterBuffer = jitterBuffer;
    
        try {
          const response = this.deepgramTTS.speak.request(
            { text },
            {
              model: "aura-asteria-en",
              encoding: "opus",
              bit_rate: 24000,
            }
          );
    
          const streamResponse = await response;
          const stream = await streamResponse.getStream();
    
          if (stream) {
            await this.processAudio(stream, sessionId, jitterBuffer);
          }
        } catch (error) {
          console.log("Error sending to text-to-speech:", error);
          this.endCurrentSession();
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
    
      private async processAudio(
        response: ReadableStream<Uint8Array>,
        sessionId: string,
        jitterBuffer: JitterBuffer
    ) {

        const audioBuffer = await this.getAudioBuffer(response);
        const audioStream = Readable.from(audioBuffer);

        const oggDemuxer = new prism.opus.OggDemuxer() 
        audioStream.pipe(oggDemuxer);
        
        oggDemuxer.on("data", (opusFrame: Buffer) => {
          const currentPacketTimestamp = this.rtpTimestamp;
          const rtpPackets = this.createRtpPacket(opusFrame)
    
          const sequence = this.rtpSequenceNumber - 1;

          jitterBuffer.addPacket(sessionId ,sequence, rtpPackets, currentPacketTimestamp)
        });
        
        oggDemuxer.on("error", (err: Error) => {
          console.error("Ogg demuxer error:", err);
        });
        
        oggDemuxer.on("end", () => {
          console.log("Ogg demuxer ended");
          jitterBuffer?.flushAllGradually();
          jitterBuffer.reset();
       
          this.currentSessionId = null;
          this.currentJitterBuffer = null;
        });
      }

      private endCurrentSession(): void {
        if (this.currentJitterBuffer) {
            console.log(`Ending session ${this.currentSessionId}: flushing and resetting jitter buffer`);
            this.currentJitterBuffer.flushAllGradually();
            this.currentJitterBuffer.reset();
        }
        this.currentSessionId = null;
        this.currentJitterBuffer = null;
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
    
        
        rtpPacket.setPayloadType(100);
        rtpPacket.setSequenceNumber(this.rtpSequenceNumber++);
        rtpPacket.setTimestamp(this.rtpTimestamp);
        this.rtpTimestamp += 960;
        rtpPacket.setSsrc(this.rtpSSRC);
        const payloadDataView = new DataView(opusPayload.buffer, opusPayload.byteOffset, opusPayload.byteLength);
        rtpPacket.setPayload(payloadDataView);
        const packetLength = rtpPacket.getByteLength();
        const arrayBuffer = new ArrayBuffer(packetLength);
        rtpPacket.serialize(arrayBuffer);
        return Buffer.from(arrayBuffer);
      }
}