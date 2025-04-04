import { v4 as uuidv4 } from 'uuid';
import { RtpCapabilities } from 'mediasoup/node/lib/rtpParametersTypes.js';
import { AgentTrack } from './agent-track.js';
import { DirectTransport } from 'mediasoup/node/lib/DirectTransportTypes.js';
import { VAD } from '../../vad/core/vad.js';
import { Audio } from '../../audio/core/audio.js';
import { STT } from '../../stt/index.js';
import { LLM } from '../../llm/llm.js';
import { TTS } from '../../tts/index.js';
import { RTP } from '../../audio/core/rtp.js';
import { Socket } from 'socket.io';
import EventEmitter from 'node:events';
import { UserInput } from './userInput.js';
import { AgentOutput } from './agent-output.js';


export class AgentPipeline extends EventEmitter {
    public readonly agentId: string;
    private _transport: DirectTransport | null = null;
    private socket: Socket | null = null
    private userInput: UserInput | null = null
    private agentOutput: AgentOutput | null = null
    private audio: Audio | null = null
    private rtp: RTP | null = null
    private stt: STT
    private llm: LLM
    private vad: VAD
    private tts: TTS
    public mediaTracks: AgentTrack;

    constructor(vad: VAD, prompt: string) {
        super()
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
        const consumerTrack = await this.mediaTracks.createAgentConsumerTrack({
            transport: this.transport!,
            rtpCap: rtpCap,
            trackId,
        })

        this.audio = await Audio.create({
            channel: 1,
            sampleRate: 16000,
            samplesPerChannel: 512
        })

        this.userInput = new UserInput(
            this.vad.stream(), 
            this.stt.stream(),
            this.audio.stream(),
            consumerTrack
        )
    }

    listener() {
        
    }

    closeStream() {
        const sttStream = this.stt.stream()
        const ttsStream = this.tts.stream()
        sttStream.closeConnection()
        ttsStream.closeConnection()
    }

    async publishTrack() {
        if(!this.userInput) {
            throw new Error("User Input is not initialized")
        }
        const producerTrack = await this.mediaTracks.createAgentProducerTrack({
            transport: this.transport!,
            listenerTrack: this.mediaTracks.agentConsumerTrack!,
        })

        this.rtp = RTP.create({
            channel: 1,
            sampleRate: 48000,
            samplesPerChannel: 480,
            ssrc: this.userInput.consumerTrack.rtpParameters.encodings?.[0]?.ssrc,
        })

        this.agentOutput = new AgentOutput(
            this.llm.chat(),
            this.tts.stream(),
            this.rtp.stream(),
            producerTrack
        )

        this.userInput.on('END_OF_SPEECH_STT', (transcript) => {
            if (!this.agentOutput?.speaking) {
                this.agentOutput?._llmStream.sendMessage(transcript);
            } else {
                console.log("Skipping transcript, agent is currently speaking.");
            }
        })

        return producerTrack.id
    }

    get transport() {
        return this._transport
    }

    
}