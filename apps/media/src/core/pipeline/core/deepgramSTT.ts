import { createClient, type ListenLiveClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import "dotenv/config";
import { AudioEnergyFilter } from "../../audio/audio-energy-filter.js";
import { AudioByteStream } from "../../audio/audio-byte-stream.js";



export class DeepgramSTT {
  private deepgramSTT: ReturnType<typeof createClient>;
  private connection: ListenLiveClient | null = null;
  private audioEnergyFilter: AudioEnergyFilter
  private keepAliveInterval: NodeJS.Timeout | null = null;
  private isAgentSpeaking: boolean = false;
  private isAgentGeneratingResponse: boolean = false;

  constructor() {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    this.deepgramSTT = createClient(apiKey);
    this.audioEnergyFilter = new AudioEnergyFilter()

    if (!apiKey) {
      throw new Error("Deepgram API key is missing.");
    }
  }

  public async createConnection(): Promise<ListenLiveClient> {
    if (this.connection) {
      return this.connection;
    }

    this.connection = this.deepgramSTT.listen.live({
      model: "nova-3",
      punctuate: true,
      smart_format: true,
      interim_results: true,
      channels: 1,
      encoding: "linear16",
      sample_rate: 16000,
      filler_words: false,
      language: "en-US",
      vad_events: true,
      endpointing:25,
      no_delay: true,
      profanity_filter: false,
      dictation: true
    });

    this.setupEventListeners();
    return this.connection;
  }

  private setupEventListeners (): void {
    if (!this.connection) return;

    this.connection.on(LiveTranscriptionEvents.Open, async () => {
      console.log("Deepgram connected");
      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval);
      }
      this.keepAliveInterval = setInterval(() => {
        this.connection?.keepAlive();
      }, 3000);
    });

    this.connection.on(LiveTranscriptionEvents.Transcript, async (data) => {
      console.log("event", data.channel.alternatives)
      if (data.channel && data.channel.alternatives.length > 0) {
        const transcript = data.channel.alternatives[0].transcript;
        if (data.is_final && transcript.trim().length > 0) {
        console.log(transcript)
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

    this.connection.on(LiveTranscriptionEvents.SpeechStarted, () => {
      console.log("speech started")
    })

    this.connection.on(LiveTranscriptionEvents.UtteranceEnd, () => {
      console.log("speech ended")
    })
  }



  public async sendAudio(data: ArrayBuffer): Promise<void> {
    if (!this.connection) {
        console.warn("No active connection to send audio.");
        return;
    }
    if (this.isAgentSpeaking) return
    if (this.isAgentGeneratingResponse) return

    const samples100Ms = Math.floor(1600 / 10);

    const stream = new AudioByteStream(
      16000,
      1,
      samples100Ms
    )

    const frames = stream.write(data)

     for await (const frame of frames) {
      if(this.audioEnergyFilter.pushFrame(frame)) {
         this.connection.send(frame.data.buffer)
      }
    }
  }

  public closeConnection(): void {
    if (this.connection) {
      this.connection.requestClose();
      this.connection = null;
    }
    this.cleanupConnection();
  }

  
  private cleanupConnection(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
    this.connection = null;
  }
}
