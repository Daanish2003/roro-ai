import { TTS as BaseTTS, TTSStream as BaseStreamTTS } from "./utils.js"
import { createClient, LiveTTSEvents, SpeakLiveClient, SpeakSchema } from "@deepgram/sdk"

export type TTSOptions = SpeakSchema


export const defaultTTSOptions: TTSOptions = {
    model: 'aura-asteria-en',
    encoding: 'linear16',
    container: 'none',
    sample_rate: 48000,
}

export class TTS extends BaseTTS {
    private options: TTSOptions;
    private connection: SpeakLiveClient;
    constructor(opts: TTSOptions, ws: SpeakLiveClient) {
        super();
        this.options = opts
        this.connection = ws
    }

    static create(opts: Partial<TTSOptions> = {}) {
        const mergedOptions = {...defaultTTSOptions, ...opts}
        const client = createClient(process.env.DEEPGRAM_API_KEY)
        const connection = client.speak.live(mergedOptions)
        return new TTS(mergedOptions, connection)
    }

    stream(): streamTTS {
        return new streamTTS(
            this,
            this.options,
            this.connection
        )
    }
}

export class streamTTS extends BaseStreamTTS {
    private options: TTSOptions
    private connection: SpeakLiveClient
    constructor(tts: TTS, opts: TTSOptions, ws: SpeakLiveClient){
        super(tts)
        this.options = opts
        this.connection = ws
        this.setupListener()
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
    
        this.connection.on(LiveTTSEvents.Audio, (data: Buffer) => {
            const sdata = this.convertMonoToStereo(data)
            this.output.put(sdata)
        })
    }

    convertMonoToStereo(monoBuffer: Buffer): Buffer {
        const sampleCount = monoBuffer.length / 2;
        const stereoBuffer = Buffer.alloc(monoBuffer.length * 2);
    
        for (let i = 0; i < sampleCount; i++) {
            const sample = monoBuffer.readInt16LE(i * 2); 
    
            stereoBuffer.writeInt16LE(sample, i * 4); 
            stereoBuffer.writeInt16LE(sample, i * 4 + 2);
        }
    
        return stereoBuffer;
    }

    public sendText(text: string) {
        this.connection.sendText(text)
        this.connection.flush()
      }
}