import EventEmitter from "node:events";
import { LLMStream } from "../../llm/llm.js";
import { streamTTS } from "../../tts/index.js";
import { RTPStream } from "../../audio/core/rtp.js";
import { Producer } from "mediasoup/node/lib/types.js";

export class AgentOutput extends EventEmitter {
    private llmStream: LLMStream
    private ttsStream: streamTTS
    private rtpStream: RTPStream
    private _producerTrack: Producer
    private _speaking: boolean = false

    constructor(llmStream: LLMStream, ttsStream: streamTTS, rtpStream: RTPStream, producerTrack: Producer) {
        super()
        this._producerTrack = producerTrack
        this.llmStream = llmStream
        this.ttsStream = ttsStream
        this.rtpStream = rtpStream
        this.producerTrack.on('listenererror', (data) => {
            console.log(data)
        })
        this.run()
    }

    private async run() {
        await Promise.all([this.llmStreamCo(), this.ttsStreamCo(), this.rtpStreamCo()])
        this.llmStream.close()
        this.ttsStream.close()
        this.rtpStream.close()
    }

    private async llmStreamCo() {
        for await (const text of this.llmStream) {
            this.ttsStream.push(text)
        }
    }

    private async ttsStreamCo() {
        for await (const buffer of this.ttsStream) {
            this.rtpStream.pushStream(buffer)
        }
    }

    private async rtpStreamCo() {
        const packetQueue: Buffer[] = [];
        
        (async () => {
            for await (const rtpPacket of this.rtpStream) {
                packetQueue.push(rtpPacket);
            }
        })();
    
        setInterval(() => {
            if (packetQueue.length > 0) {
                this._speaking = true
                const rtpPacket = packetQueue.shift();
                this.producerTrack?.send(rtpPacket!)
            } else {
                this._speaking = false
            }
        }, 20);
    };

    get speaking():boolean {
        return this._speaking
    }

    get producerTrack() {
        return this._producerTrack
    }

    get _llmStream() {
        return this.llmStream
    }
}