import { createClient, LiveTTSEvents, SpeakLiveClient } from "@deepgram/sdk";

export class DeepgramTTS {
  private deepgramTTS : ReturnType<typeof createClient>
  private connection: SpeakLiveClient

  constructor() {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    this.deepgramTTS = createClient(apiKey);

    if (!apiKey) {
      throw new Error("Deepgram API key is missing.");
    }

    this.connection = this.createConnection()
  }

  private createConnection() {
    const connection = this.deepgramTTS.speak.live(
      { 
        model: 'aura-asteria-en',
        encoding: 'linear16',
        container: 'none',
        sample_rate: 48000,
      }
    );

    this.setupListener()
    return connection
  }


  private setupListener() {
    this.connection.on(LiveTTSEvents.Open, () => {
      console.log("Connection opened");
    })

    this.connection.on(LiveTTSEvents.Close, () => {
      console.log("Connection closed")
    })

    this.connection.on(LiveTTSEvents.Error, (error) => {
      console.log("Deepgram error", error)
    })

    this.connection.on(LiveTTSEvents.Metadata, (data) => {
      console.dir(data, { depth: null });
    });

    this.connection.on(LiveTTSEvents.Audio, (data) => {
      console.log(data)
    })
  }

  public sendText(text: string) {
    this.connection.sendText(text)
    this.connection.flush()
  }
}