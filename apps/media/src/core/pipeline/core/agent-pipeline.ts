import { v4 as uuidv4 } from 'uuid';
import { RtpCapabilities } from 'mediasoup/node/lib/rtpParametersTypes.js';
import { AgentTrack } from './agent-track.js';
import { DirectTransport } from 'mediasoup/node/lib/DirectTransportTypes.js';
// import { DeepgramSTT } from './deepgramSTT.js';
import { VAD } from '../../vad/core/vad.js';
import { Audio } from '../../audio/core/audio.js';
import { STT } from '../../stt/index.js';
import { LLM } from '../../llm/llm.js';
import { TTS } from '../../tts/index.js';
import { RTP } from '../../audio/core/rtp.js';
import { Consumer } from 'mediasoup/node/lib/ConsumerTypes.js';
import { DataProducer, Producer } from 'mediasoup/node/lib/types.js';
import { Socket } from 'socket.io';
import { VADEventType } from '../../../utils/event.js';


export class AgentPipeline {
    public readonly agentId: string;
    private _transport: DirectTransport | null = null;
    private socket: Socket | null = null
    public mediaTracks: AgentTrack;
    private consumerTrack : Consumer | null =null
    private producerTrack : Producer | null = null
    private audio: Audio | null = null
    private rtp: RTP | null = null
    private stt: STT
    private llm: LLM
    private vad: VAD
    private tts: TTS
    private lastTimestamp: number = -1;

    constructor(vad: VAD, prompt: string) {
        this.agentId = uuidv4();
        this.vad = vad
        this.mediaTracks = new AgentTrack();
        this.stt = STT.create();
        this.llm = new LLM(prompt)
        this.tts = TTS.create()
        
    }

    setTransport(transport: DirectTransport, socket: Socket){
        this._transport = transport
        this.socket = socket
    }

    async subscribeTrack(trackId: string, rtpCap: RtpCapabilities) {
        this.consumerTrack = await this.mediaTracks.createAgentConsumerTrack({
            transport: this.transport!,
            rtpCap: rtpCap,
            trackId,
        })

        this.audio = await Audio.create({
            channel: 1,
            sampleRate: 16000,
            samplesPerChannel: 512
        })

        this.rtp = await RTP.create({
            channel: 1,
            sampleRate: 48000,
            samplesPerChannel: 480,
            ssrc: this.consumerTrack.rtpParameters.encodings?.[0]?.ssrc,
        })

        if (!this._transport) {
            throw new Error("Transport is required for producing data.");
        }

        const audioStream = this.audio.stream()
        const vadStream = this.vad.stream()
        const sttStream = this.stt.stream()
        const llmStream = this.llm.chat()
        const ttsStream = this.tts.stream()
        const rtpStream = this.rtp.stream()

        this.consumerTrack.on('rtp', async (rtpPackets) => {
            audioStream.pushStream(rtpPackets)
        })

        async function audioStreamCo() {
            for await (const frame of audioStream) {
                vadStream.push(frame)
                sttStream.push(frame)
            }
        }

        const vadStreamCo = async () => {
            for await(const ev of vadStream) {
                if(ev.type === VADEventType.START_OF_SPEECH) {
                    this.socket!.emit("START_OF_SPEECH")
                }

                if(ev.type === VADEventType.END_OF_SPEECH) {
                    this.socket!.emit("END_OF_SPEECH")
                }
            }
        }

        async function sttStreamCo(){
            for await (const ev of sttStream) {
                const response = await llmStream.sendMessage(ev.transcript)
                console.log(response)
            }
        }

        async function llmStreamCo() {
            for await (const text of llmStream) {
                ttsStream.push(text)
            }
        }

        async function ttsStreamCo(){
            for await (const buffer of ttsStream) {
                rtpStream.pushStream(buffer)
            }
        }

        const rtpStreamCo = async () => {
            const packetQueue: Buffer[] = [];
            
            (async () => {
                for await (const rtpPacket of rtpStream) {
                    packetQueue.push(rtpPacket);
                }
            })();
        
            setInterval(() => {
                if (packetQueue.length > 0) {
                    const rtpPacket = packetQueue.shift();
                    this.producerTrack?.send(rtpPacket!)
                }
            }, 20);
        };
        
        await Promise.all([audioStreamCo(), vadStreamCo(), sttStreamCo(), llmStreamCo(), ttsStreamCo(), rtpStreamCo()]);        
    }

    get transport() {
        return this._transport
    }

    closeStream() {
        const audioStream = this.audio!.stream()
        const vadStream = this.vad.stream()
        const sttStream = this.stt.stream()
        const llmStream = this.llm.chat()
        const ttsStream = this.tts.stream()
        const rtpStream = this.rtp!.stream()

        audioStream.close()
        vadStream.close()
        sttStream.close()
        llmStream.close()
        ttsStream.close()
        rtpStream.close()
        sttStream.closeConnection()
        ttsStream.closeConnection()
    }

    async publishTrack() {
        this.producerTrack = await this.mediaTracks.createAgentProducerTrack({
            transport: this.transport!,
            listenerTrack: this.mediaTracks.agentConsumerTrack!,
        })

        this.producerTrack.on('listenererror', (data) => {
            console.log(data)
        })

        return this.producerTrack.id
    }

    
}