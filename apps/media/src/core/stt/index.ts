import { createClient, ListenLiveClient, LiveTranscriptionEvents } from "@deepgram/sdk"
import { STT as BaseSTT, STTStream as BaseStream } from "./utils.js"
import { AudioEnergyFilter } from '../../utils/index.js';
import { AudioFrame } from "../audio/audio-frame.js";
import { AudioByteStream } from "../audio/audio-byte-stream.js";
import { SpeechEventType } from "../../utils/event.js";
import { STTLanguages } from "../config/media-config.js";

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
    endpointing: 25,
    no_delay: true,
    profanity_filter: false,
    dictation: true
}

export class STT extends BaseSTT {
    private options: STTOptions
    private connection: ListenLiveClient
    private _stream: STTStream | null
    constructor(opts: STTOptions, ws: ListenLiveClient) {
        super()
        this.options = opts
        this.connection = ws
        this._stream = null
    }
    static create(opts: Partial<STTOptions> = {}) {
        const mergedOptions = {...defaultSTTOptions, ...opts}
        const client = createClient(process.env.DEEPGRAM_API_KEY)
        const connection =  client.listen.live(mergedOptions)
        return new STT(mergedOptions, connection)
    }
    stream(): STTStream {
        this._stream = new STTStream(
            this,
            this.options,
            this.connection
        )
        return this._stream
    }
}

export class STTStream extends BaseStream {
    private options: STTOptions
    private connection: ListenLiveClient
    private audioEnergyFilter: AudioEnergyFilter
    private keepAliveInterval: NodeJS.Timeout | null = null;
    private _speaking: boolean = false
    constructor(stt: STT, opts: STTOptions, ws: ListenLiveClient) {
        super(stt)
        this.options = opts
        this.connection = ws
        this.audioEnergyFilter = new AudioEnergyFilter()
        this.run();
    }

    private async run() {
        await Promise.all([this.listeners(), this.sendAudio()]);
        clearInterval(this.keepAliveInterval!);
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
        this.connection.on(LiveTranscriptionEvents.Open, () => this.handleEvent(LiveTranscriptionEvents.Open));
        this.connection.on(LiveTranscriptionEvents.Transcript, (data) => this.handleEvent(LiveTranscriptionEvents.Transcript, data));
        this.connection.on(LiveTranscriptionEvents.Metadata, (data) => this.handleEvent(LiveTranscriptionEvents.Metadata, data));
        this.connection.on(LiveTranscriptionEvents.Error, (err) => this.handleEvent(LiveTranscriptionEvents.Error, err));
        this.connection.on(LiveTranscriptionEvents.Close, () => this.handleEvent(LiveTranscriptionEvents.Close));

    }

    private handleEvent (eventType: string, data?: any) {
        switch (eventType) {
          case LiveTranscriptionEvents.Open:
            this.keepAlive()
            console.log("STT connected");
            break;
      
          case LiveTranscriptionEvents.Transcript: {
            const isFinal = data.is_final
            const isEndpoint = data.speech_final
            const alternatives = liveTranscriptionToSpeechData(this.options.language!, data)

            if(alternatives[0] && alternatives[0].text) {
                if(!this._speaking) {
                    this._speaking = true;
                    this.output.put({ type: SpeechEventType.SPEECH_STARTED})
                }

                if (isFinal) {
                    this.output.put({
                      type: SpeechEventType.FINAL_TRANSCRIPT,
                      alternatives: [alternatives[0], ...alternatives.slice(1)],
                    });
                  } else {
                    this.output.put({
                      type: SpeechEventType.INTERIM_TRANSCRIPT,
                      alternatives: [alternatives[0], ...alternatives.slice(1)],
                    });
                  }
              
              if(isEndpoint && this._speaking) {
                this._speaking = false;
                this.output.put({
                  type: SpeechEventType.END_OF_SPEECH
                })
              }
            }
            break;
          }
          case LiveTranscriptionEvents.Metadata:
            console.log("Metadata:", data);
            break;
      
          case LiveTranscriptionEvents.Error:
            console.error("Deepgram Error:", data);
            break;
      
          case LiveTranscriptionEvents.Close:
            console.log("STT Closed");
            this.cleanupConnection();
            break;
          case LiveTranscriptionEvents.SpeechStarted:
            if (this._speaking) return;
                this._speaking = true;
                this.output.put({ type: SpeechEventType.SPEECH_STARTED });
            break;
            
          default:
            console.warn("Unhandled event:", eventType);
        }
    };
      

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

    private keepAlive() {
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
          }
          this.keepAliveInterval = setInterval(() => {
            if (this.connection.isConnected()) {
                this.connection.keepAlive();
            } else {
                this.cleanupConnection(); 
            }
        }, 3000);
    }
}

const liveTranscriptionToSpeechData = (
    language: STTLanguages | string,
    data: { [id: string]: any },
  ) => {
    const alts: any[] = data['channel']['alternatives'];
  
    return alts.map((alt) => ({
      language,
      startTime: alt['words'].length ? alt['words'][0]['start'] : 0,
      endTime: alt['words'].length ? alt['words'][alt['words'].length - 1]['end'] : 0,
      confidence: alt['confidence'],
      text: alt['transcript'],
    }));
  };