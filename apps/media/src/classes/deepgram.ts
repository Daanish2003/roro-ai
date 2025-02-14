import { createClient, type ListenLiveClient, LiveTranscriptionEvents, LiveTTSEvents } from "@deepgram/sdk";
import "dotenv/config";
import { Producer } from "mediasoup/node/lib/types.js";
import ffmpeg from "fluent-ffmpeg";
import { Readable } from "stream";
import OggOpusToRtp from "rtp-ogg-opus"
import { GroqModal } from "./groq-modal.js";

export class DeepgramSTT {
  private deepgram: ReturnType<typeof createClient>;
  private connection: ListenLiveClient | null = null;
  private keepAliveInterval: NodeJS.Timeout | null = null;
  private directTransportProducer: Producer | null = null;

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
          sample_rate: 48000
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

  private convertAndStream(audioBuffer: Buffer) {
    try {
      const pcmStream = Readable.from(audioBuffer);
      const rtpOpus = new OggOpusToRtp.OggOpusToRtp({
        payloadType: 100,
        sampleRate: 48000,
      });
  
      ffmpeg(pcmStream)
        .inputFormat("s16le")
        .audioFrequency(48000)
        .audioChannels(2)
        .audioCodec("libopus")
        .toFormat("opus")
        .on('end', () => {
          console.log('Conversion finished');
        })
        .on("error", (err) => console.error("FFmpeg conversion error:", err))
        .pipe(rtpOpus);
  
      rtpOpus.on("data", (rtpPacket: Buffer) => {
        console.log("RTP packet length:", rtpPacket.length);
                 
        if (this.directTransportProducer) {
          console.log("Sending RTP packet to directTransportProducer");
          this.directTransportProducer.send(rtpPacket);
        } else {
          console.error("directTransportProducer is null");
        }
      });
  
      rtpOpus.on("end", () => {
        console.log("TTS Opus audio streaming complete.");
      });
  
      rtpOpus.on("error", (error: any) => {
        console.error("Error in RTP streaming:", error);
      });
  
    } catch (error) {
      console.error("Error in PCM to Opus streaming:", error);
    }
  }

  public setDirectTransportProducer(directTransportProducer: Producer) {
      this.directTransportProducer = directTransportProducer
  }

  private cleanupConnection(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
    this.connection = null;
  }
}
