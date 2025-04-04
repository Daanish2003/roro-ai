import EventEmitter from "node:events";
import { SpeechEventType, VADEventType } from "../../../utils/event.js";
import { AudioStream } from "../../audio/core/audio.js";
import { STTStream } from "../../stt/index.js";
import { VADStream } from "../../vad/core/vad.js";
import { Consumer } from "mediasoup/node/lib/ConsumerTypes.js";

export class UserInput extends EventEmitter {
    private audioStream: AudioStream
    private vadStream: VADStream
    private sttStream: STTStream;
    private _consumerTrack: Consumer
    private _speaking: boolean = false;
    private _transcript: string = ""

    constructor(vadStream: VADStream, sttStream: STTStream, audioStream: AudioStream, consumerTrack: Consumer) {
        super()
        this._consumerTrack = consumerTrack
        this.vadStream = vadStream
        this.sttStream = sttStream
        this.audioStream = audioStream
        this._consumerTrack.on('rtp', async (rtpPackets) => {
            audioStream.pushStream(rtpPackets)
        })
        this.run()
    }

    private async run() {
        await Promise.all([this.audioStreamCo(), this.vadStreamCo(), this.sttStreamCo()])
        this.audioStream.close()
        this.vadStream.close()
        this.sttStream.close()
    }

    private async audioStreamCo() {
        for await (const frame of this.audioStream) {
            this.vadStream.push(frame)
            this.sttStream.push(frame)
        }
    }

    private async vadStreamCo() {
        for await(const ev of this.vadStream) {
            if(ev.type === VADEventType.START_OF_SPEECH) {
                this.emit("START_OF_SPEECH")
            }
            if(ev.type === VADEventType.END_OF_SPEECH) {
                this.emit("END_OF_SPEECH")
            }
        }
    }

    private async sttStreamCo() {
        for await (const ev of this.sttStream) {
             if(ev.type === SpeechEventType.FINAL_TRANSCRIPT) {
                this._transcript += ev.transcript
             }

             if(ev.type === SpeechEventType.END_OF_SPEECH) {
                this.emit("END_OF_SPEECH_STT", this._transcript)
                this._transcript = ""
             }
        }
    }

    get consumerTrack() {
        return this._consumerTrack
    }

    get speaking(): boolean {
        return this._speaking
    }
}