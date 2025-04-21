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
    private future: Future | null = null;
    private interrupted: boolean = false;

    constructor(tts: TTS, opts: TTSOptions, ws: SpeakLiveClient) {
        super(tts);
        this.options = opts;
        this.connection = ws;
        this.run();
    }

    private setupListener() {
        this.connection.on(LiveTTSEvents.Open, () => this.handleEvent(LiveTTSEvents.Open));
        this.connection.on(LiveTTSEvents.Close, () => this.handleEvent(LiveTTSEvents.Close));
        this.connection.on(LiveTTSEvents.Error, (err) => this.handleEvent(LiveTTSEvents.Error, err));
        this.connection.on(LiveTTSEvents.Metadata, (data) => this.handleEvent(LiveTTSEvents.Metadata, data));
        this.connection.on(LiveTTSEvents.Warning, (data) => this.handleEvent(LiveTTSEvents.Warning, data));
        this.connection.on(LiveTTSEvents.Unhandled, (data) => this.handleEvent(LiveTTSEvents.Unhandled, data));
        this.connection.on(LiveTTSEvents.Flushed, () => this.handleEvent(LiveTTSEvents.Flushed));
        this.connection.on(LiveTTSEvents.Audio, (data) => this.handleEvent(LiveTTSEvents.Audio, data));
    }

    private handleEvent(eventType: string, data?: any) {
        switch (eventType) {
            case LiveTTSEvents.Open:
                break;

            case LiveTTSEvents.Close:
                console.log("Connection closed");
                break;

            case LiveTTSEvents.Error:
                console.log("Deepgram error", data);
                break;

            case LiveTTSEvents.Metadata:
                console.dir(data, { depth: null });
                break;

            case LiveTTSEvents.Flushed:
                if (this.future && !this.future.done) {
                    this.future.resolve();
                    console.log("Flushed")
                }
                break;

            case LiveTTSEvents.Warning:
                console.log("Deepgram STT [WARN]:", data)
                break
            case LiveTTSEvents.Unhandled:
                console.log("Deepgram Unhandled", data)
                break

            case LiveTTSEvents.Audio: {
                const buffer = Buffer.from(data);
                this.audioBuffer = Buffer.concat([this.audioBuffer, buffer]);

                const chunkSize = 960 * 2;

                while (this.audioBuffer.length >= chunkSize) {
                    const chunk = this.audioBuffer.subarray(0, chunkSize);
                    if(this.interrupted) {
                        this.future?.resolve()
                    }
                    this.output.put(chunk);
                    this.audioBuffer = this.audioBuffer.subarray(chunkSize);
                }
                break;
            }

            default:
                console.warn("Unhandled event:", eventType);
        }
    }

    private async run() {
        await Promise.all([this.sendText(), this.setupListener()])
    }

    private async sendText() {
        for await (const text of this.input) {
            if (this.interrupted) {
                console.log("TTS stream interrupted — stopping input.");
                break;
            }

            if (typeof text === 'symbol') continue;
            this.future = new Future();
            console.log(text)
            this.connection.sendText(text);
            this.connection.flush();

            try {
                await this.future.await;
            } catch (err) {
                console.error("Future rejected:", err);
                break;
            }
        }
    }

    public closeConnection() {
        this.interrupt();
        if (this.connection) {
            this.connection.requestClose();
        }
    }

    public interrupt() {
        this.interrupted = true;
    }
}
