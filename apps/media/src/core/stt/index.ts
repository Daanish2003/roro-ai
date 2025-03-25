import { createClient, ListenLiveClient, LiveTranscriptionEvents } from "@deepgram/sdk"
import { STT as BaseSTT, STTStream as BaseStream } from "./utils.js"
import { AudioEnergyFilter } from '../../utils/index.js';
import { AudioFrame } from "../audio/audio-frame.js";
import { AudioByteStream } from "../audio/audio-byte-stream.js";
import { SpeechEventType } from "../../utils/event.js";

export interface STTOptions {
    model: string,
    punctuate: boolean,
    smart_format: boolean,
    interim_results: boolean,
    channels: number,
    encoding: string,
    sample_rate: number,
    filler_words: boolean,
    language: string,
    vad_events: boolean,
    utterance_end_ms: number
    endpointing: number,
    no_delay: boolean,
    profanity_filter: boolean,
    dictation: boolean
}


export const defaultSTTOptions: STTOptions = {
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
    utterance_end_ms: 1000,
    endpointing: 25,
    no_delay: true,
    profanity_filter: false,
    dictation: true
}

export class STT extends BaseSTT {
    private options: STTOptions
    private connection: ListenLiveClient
    private streams: STTStream[] = []
    constructor(opts: STTOptions, ws: ListenLiveClient) {
        super()
        this.options = opts
        this.connection = ws
    }
    static create(opts: Partial<STTOptions> = {}) {
        const mergedOptions = {...defaultSTTOptions, ...opts}
        const client = createClient(process.env.DEEPGRAM_API_KEY)
        const connection =  client.listen.live(mergedOptions)
        return new STT(mergedOptions, connection)
    }
    stream(): STTStream {
        const stream = new STTStream(
            this,
            this.options,
            this.connection
        )
        this.streams.push(stream)
        return stream
    }
}

export class STTStream extends BaseStream {
    private options: STTOptions
    private connection: ListenLiveClient
    private audioEnergyFilter: AudioEnergyFilter
    private keepAliveInterval: NodeJS.Timeout | null = null;
    constructor(stt: STT, opts: STTOptions, ws: ListenLiveClient) {
        super(stt)
        this.options = opts
        this.connection = ws
        this.audioEnergyFilter = new AudioEnergyFilter()
        this.run()
    }

    private async run() {
            await Promise.all([this.sendAudio(), this.listeners()]);
    }

    private async sendAudio() {
        const samples100Ms = Math.floor(this.options.sample_rate / 32);
        const stream = new AudioByteStream(
            this.options.sample_rate,
            this.options.channels,
            samples100Ms
        )
        for await (const frame of this.input) {
            let frames: AudioFrame[];

            if(frame === BaseStream.FLUSH_TRANSCRIPT) {
                frames = stream.flush()
            } else if (
                frame.sampleRate === this.options.sample_rate ||
                frame.channels === this.options.channels
            ) {
                frames = stream.write(frame.data.buffer)
            } else {
                throw new Error(`sample rate or channel count of frame does not match`);
            }

            for await(const frame of frames) {
                if(this.audioEnergyFilter.pushFrame(frame)) {
                    this.connection.send(frame.data.buffer)
                }
            }
        }
    }


    private async listeners() {
        if(!this.connection) {
            console.log("no connection")
            return
        }
        this.connection.on(LiveTranscriptionEvents.Open, () => {
              console.log("STT connected");

              console.log(this.keepAliveInterval)
              
              if (this.keepAliveInterval) {
                clearInterval(this.keepAliveInterval);
              }
              this.keepAliveInterval = setInterval(() => {
                this.connection.keepAlive();
              }, 3000);
            });
        
        this.connection.on(LiveTranscriptionEvents.Transcript, async (data) => {
            if (data.channel && data.channel.alternatives.length > 0) {
                const transcript = data.channel.alternatives[0].transcript;
                if (data.is_final && data.speech_final && transcript.trim().length > 0) {
                    console.log(transcript)
                  this.output.put({
                    type: SpeechEventType.FINAL_TRANSCRIPT,
                    transcript
                  })
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
          console.log("STT Closed");
          this.cleanupConnection();
        });
    }

    public closeConnection(): void {
        if (this.connection) {
          this.connection.requestClose();
        }
        this.cleanupConnection();
    }

    private cleanupConnection(): void {
        if (this.keepAliveInterval) {
          clearInterval(this.keepAliveInterval);
          this.keepAliveInterval = null;
        }
    }
}