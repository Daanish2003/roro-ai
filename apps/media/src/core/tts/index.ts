import { Future } from "../../utils/index.js";
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
    private _stream: streamTTS | null;
    constructor(opts: TTSOptions, ws: SpeakLiveClient) {
        super();
        this.options = opts
        this.connection = ws
        this._stream = null
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
    private audioBuffer: Buffer = Buffer.alloc(24000);
    private future: Future |  null = null
    constructor(tts: TTS, opts: TTSOptions, ws: SpeakLiveClient){
        super(tts)
        this.options = opts;
        this.connection = ws;
        this.run();
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

        this.connection.on(LiveTTSEvents.Flushed, () => {
            if (this.future && !this.future.done) {
                this.future.resolve();
            }
        })
    
        this.connection.on(LiveTTSEvents.Audio, (data) => {
            const buffer = Buffer.from(data);
            this.audioBuffer = Buffer.concat([this.audioBuffer, buffer]);

            const chunkSize = 960 * 2

            while(this.audioBuffer.length >= chunkSize) {
                const chunk = this.audioBuffer.subarray(0, chunkSize)
                this.output.put(chunk)
                this.audioBuffer = this.audioBuffer.subarray(chunkSize)
            }
        })
    }

    private async run() {
        await Promise.all([this.setupListener(), this.sendText()])
    }

    private async sendText() {
        for await(const text of this.input) {

            const textChunks = text.split(",").map(chunk => chunk.trim()).filter(Boolean);

            for (const chunk of textChunks) {
                this.future = new Future()
                this.connection.sendText(chunk + ",")
               this.connection.flush()
               await this.future.await
            }
        }
    }

    public closeConnection() {
        if (this.connection) {
            this.connection.requestClose();
        }
    }
}