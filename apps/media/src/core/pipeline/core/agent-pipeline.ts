import { v4 as uuidv4 } from 'uuid';
import { AgentTrack } from './agent-track.js';
import { Audio, AudioStream } from '../../audio/core/audio.js';
import { Socket } from 'socket.io';
import { UserInput } from './userInput.js';
import { AgentOutput } from './agent-output.js';
import { vad } from '../../../index.js';
import { STT } from '../../stt/index.js';
import { LLM } from '../../llm/llm.js';
import { TTS } from '../../tts/index.js';
import { Producer } from 'mediasoup/node/lib/types.js';
import { BaseAgentPipeline, BaseAgentStream } from '../utils.js';
import { SpeechEvent } from '../../stt/utils.js';


export class AgentPipeline extends BaseAgentPipeline {
    public readonly agentId: string
    private socket?: Socket
    public mediaTracks: AgentTrack;
    #prompt: string
    #audio: Audio
    #userInput: UserInput
    #audioStream: AudioStream
    #agentOutput: AgentOutput
    #producerTrack: Producer 
    constructor(prompt: string, producerTrack: Producer) {
        super()
        this.agentId = uuidv4();
        this.#prompt = prompt
        this.#producerTrack = producerTrack
        this.mediaTracks = new AgentTrack();
        this.#audio = Audio.create()
        this.#audioStream = this.#audio.stream()
        this.#userInput = new UserInput(vad, STT.create())
        this.#agentOutput = new AgentOutput(new LLM(this.#prompt), TTS.create(), this.#producerTrack)
    }

    setSocket(socket: Socket){
        this.socket = socket
    }

    stream(): BaseAgentStream {
        return new AgentStream(
            this,
            this.#audio,
            this.#agentOutput,
            this.#producerTrack!,
            this.#userInput,
            this.#audioStream,
            this.socket!,
        )
    }
}


export class AgentStream extends BaseAgentStream {
    #socket: Socket
    #audio: Audio
    #userInput: UserInput
    #audioStream: AudioStream
    #agentOutput: AgentOutput
    #producerTrack: Producer
    #endOfUtteranceTimer: NodeJS.Timeout | null = null;
    #transcriptBuffer: string = '';
    #interimText: string = ''
    #backupTranscript: string = '';
    #transcriptSegments: { text: string, start: number; end: number}[] = []
    #agentSpeaking: boolean = false
    #userSpeaking: boolean = false
    #userCommitted: boolean = false
    #agentCommitted: boolean = false


    constructor(
        agent: AgentPipeline, 
        audio: Audio, 
        agentOutput: AgentOutput, 
        producerTrack: Producer,
        userInput: UserInput,
        audioStream: AudioStream,
        socket: Socket,
    ) {
        super(agent)
        this.#audio = audio
        this.#audioStream = audioStream
        this.#userInput = userInput
        this.#agentOutput = agentOutput
        this.#producerTrack = producerTrack
        this.#socket = socket
        this.run()
    }

    private async run() {
        this.#userInput.on('START_OF_SPEECH', this.onUserStartSpeech)
        this.#userInput.on('END_OF_SPEECH', this.onUserStopSpeech)
        this.#userInput.on('FINAL_TRANSCRIPT', this.onFinalTrancript)
        this.#userInput.on('INTERIM_TRANSCRIPT', this.onInterimTranscript)
        this.#agentOutput.on('AGENT_COMMITTED', this.onAgentCommitted)
        this.#agentOutput.on('AGENT_START_SPEAKING', this.onAgentStartSpeaking)
        this.#agentOutput.on('AGENT_STOP_SPEAKING', this.onAgentStopSpeaking)
        this.#agentOutput.on('AGENT_INTERRUPTED', this.onAgentInterupted)
        this.listenStreamCo()
    }

    async listenStreamCo() {
        const agentLoop = async() => {
            for await (const stream of this.input) {
                this.#audioStream.pushStream(stream)
            }
        }

        const audioLoop = async () => {
            for await (const frame of this.#audioStream) {
                this.#userInput.push(frame)
            }
        }

        await Promise.all([agentLoop(), audioLoop()])
    }

    private onUserStartSpeech = async () => {
        this.#socket.emit('START_OF_SPEECH')
        this.#userSpeaking = true

        if (this.#agentSpeaking || this.#endOfUtteranceTimer) {
            await this.onInterrupt();
        }

    }

    private onAgentInterupted = () => {
        this.#agentSpeaking = false
        this.#agentCommitted = false
    }

    private onUserStopSpeech = () => {
        this.#socket.emit('END_OF_SPEECH')
        this.#userSpeaking = false
    }

    private onAgentCommitted = () => {
        this.#agentCommitted = true
    }

    private onAgentStartSpeaking = () => {
        if(!this.#agentCommitted) return
        this.#agentSpeaking = true;
    }



    private onAgentStopSpeaking = () => {
        this.#agentCommitted = false
        this.#agentSpeaking = false;
    }

    private onFinalTrancript = (event: SpeechEvent) => {
        const alt = event.alternatives?.[0]; 
        this.#transcriptBuffer += " " + alt!.text
        this.#transcriptSegments.push({
            text: alt!.text,
            start: alt!.startTime,
            end: alt!.endTime
        })

        this.scheduleEndOfUtterance(1500);
    }

    private onInterimTranscript = (event: SpeechEvent) => {
        const alt = event.alternatives?.[0];
        this.#interimText = alt!.text; 
        if (this.#userSpeaking && this.#endOfUtteranceTimer) {
            clearTimeout(this.#endOfUtteranceTimer);
            this.#endOfUtteranceTimer = null;
        }
    }

    private scheduleEndOfUtterance(delay: number) {
        if (this.#endOfUtteranceTimer) {
            clearTimeout(this.#endOfUtteranceTimer);
            this.#endOfUtteranceTimer = null
        }

        this.#endOfUtteranceTimer = setTimeout(() => {
            this.handleEndOfTurn();
        }, delay);
    }

    private handleEndOfTurn() {
        console.log("End of turn detected — trigger action");
    
        let finalTranscript = this.#transcriptBuffer;
    
        if (this.#backupTranscript.length > 0) {
            finalTranscript = (this.#backupTranscript + " " + this.#transcriptBuffer).trim();
        }
    
        this.#backupTranscript = '';
        this.#transcriptBuffer = '';
        this.#transcriptSegments = [];
    
        this.#agentOutput.run(finalTranscript);
    }
    

    private onInterrupt = async () => {
        console.log("User interrupted, current transcript:", this.#transcriptBuffer);
        this.#backupTranscript = this.#transcriptBuffer;
        this.#transcriptBuffer = "";
        this.#transcriptSegments = [];

        if (this.#endOfUtteranceTimer) {
            clearTimeout(this.#endOfUtteranceTimer);
            this.#endOfUtteranceTimer = null;
        }

        await this.#agentOutput.interrupt()
        
    }
}