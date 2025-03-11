import { createClient, type ListenLiveClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import "dotenv/config";
import { Room } from "./room.js";


export class DeepgramSTT {
  private room: Room
  private deepgramSTT: ReturnType<typeof createClient>;
  private connection: ListenLiveClient | null = null;
  private keepAliveInterval: NodeJS.Timeout | null = null;
  private isAgentSpeaking: boolean = false;
  private isAgentGeneratingResponse: boolean = false;
  private isGeneratingVoice: boolean = false;

  constructor(room: Room) {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    this.deepgramSTT = createClient(apiKey);

    if (!apiKey) {
      throw new Error("Deepgram API key is missing.");
    }

    this.room = room

    this.room.on("AGENT_START_SPEAKING", () => {
       this.isAgentSpeaking = true
    })

    this.room.on("AGENT_STOP_SPEAKING", () => {
      this.isAgentSpeaking = false
    })

    this.room.on("AGENT_GENERATING_RESPONSE", () => {
      this.isAgentGeneratingResponse = true
    })

    this.room.on("AGENT_RESPONDED", () => {
      this.isAgentGeneratingResponse = false
    })

    this.room.on("GENERATING_VOICE", () => {
      this.isGeneratingVoice = true
    })

    this.room.on("GENERATED_VOICE", () => {
      this.isGeneratingVoice = false
    })
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
      channels: 2,
      encoding: "linear16",
      sample_rate: 48000,
      filler_words: false,
      language: "en-US",
      vad_events: true,
      utterance_end_ms: 3000,
      endpointing:1000,
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



  public sendAudio(audioFrame: Buffer): void {
    if (!this.connection) {
        console.warn("No active connection to send audio.");
        return;
    }

    if (this.isAgentSpeaking) return
    if (this.isAgentGeneratingResponse) return

    this.connection.send(audioFrame);
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
