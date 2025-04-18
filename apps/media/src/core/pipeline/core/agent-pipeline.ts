import { v4 as uuidv4 } from 'uuid';
import { AgentTrack } from './agent-track.js';
import { AudioStream } from '../../audio/core/audio.js';
import { Socket } from 'socket.io';
import { UserInput } from './userInput.js';
import { AgentOutput } from './agent-output.js';
import { vad } from '../../../index.js';
import { STT } from '../../stt/index.js';
import { LLM } from '../../llm/llm.js';
import { TTS } from '../../tts/index.js';
import { Producer } from 'mediasoup/node/lib/types.js';
import { SpeechEvent } from '../../stt/utils.js';
import { AudioFrame } from '../../audio/audio-frame.js';

export class AgentPipeline {
    public readonly agentId: string;
    private socket?: Socket;
    public mediaTracks: AgentTrack;
    #prompt: string;
    #llm: LLM;
    #tts: TTS;
    #stt: STT;
    #userInput: UserInput;
    #audioStream: AudioStream;
    #agentOutput: AgentOutput;
    #producerTrack: Producer;
    #endOfUtteranceTimer: NodeJS.Timeout | null = null;
    #transcriptBuffer: string = '';
    #interimText: string = '';
    #backupTranscript: string = '';
    #transcriptSegments: { text: string, start: number; end: number }[] = [];
    #agentSpeaking: boolean = false;
    #userSpeaking: boolean = false;

    constructor(prompt: string, producerTrack: Producer, ssrc: number) {
        this.agentId = uuidv4();
        this.#prompt = prompt;
        this.#producerTrack = producerTrack;
        this.mediaTracks = new AgentTrack();
        this.#llm = new LLM(this.#prompt);
        this.#audioStream = new AudioStream();
        this.#stt = STT.create();
        this.#userInput = new UserInput(vad, this.#stt);
        this.#tts = TTS.create();
        this.#agentOutput = new AgentOutput(this.#tts, this.#llm, this.#producerTrack, ssrc);

        this.#setupListeners();
    }

    setSocket(socket: Socket) {
        this.socket = socket;
    }

    stream(buffer: Buffer) {
        this.#audioStream.run(buffer)
    }

    #setupListeners() {
        this.#audioStream.on('FRAME', this.#onFrame);
        this.#userInput.on('STT_CONNECTED', this.#onSTTConnected);
        this.#userInput.on('START_OF_SPEECH', this.#onUserStartSpeech);
        this.#userInput.on('END_OF_SPEECH', this.#onUserStopSpeech);
        this.#userInput.on('FINAL_TRANSCRIPT', this.#onFinalTranscript);
        this.#userInput.on('INTERIM_TRANSCRIPT', this.#onInterimTranscript);
        this.#agentOutput.on('AGENT_START_SPEAKING', this.#onAgentStartSpeaking);
        this.#agentOutput.on('AGENT_STOP_SPEAKING', this.#onAgentStopSpeaking);
        this.#agentOutput.on('AGENT_INTERRUPTED', this.#onAgentInterrupted);

    }

    #onFrame = async (frame: AudioFrame) => {
        this.#userInput.push(frame)
    }

    #onSTTConnected = async () => {
        this.socket?.emit('STT_CONNECTED')
    }

    #onUserStartSpeech = async () => {
        this.socket?.emit('START_OF_SPEECH');
        this.#userSpeaking = true;

        if (this.#agentSpeaking || this.#endOfUtteranceTimer) {
            this.#agentSpeaking = false;
            await this.#onInterrupt();
        }
    };

    #onUserStopSpeech = () => {
        this.socket?.emit('END_OF_SPEECH');
        this.#userSpeaking = false;
    };

    #onFinalTranscript = (event: SpeechEvent) => {
        const alt = event.alternatives?.[0];
        if (!alt) return;

        this.#transcriptBuffer += ' ' + alt.text;
        this.#transcriptSegments.push({
            text: alt.text,
            start: alt.startTime,
            end: alt.endTime,
        });

        this.#scheduleEndOfUtterance(1500);
    };

    #onInterimTranscript = (event: SpeechEvent) => {
        const alt = event.alternatives?.[0];
        if (!alt) return;

        this.#interimText = alt.text;
        if (this.#userSpeaking && this.#endOfUtteranceTimer) {
            clearTimeout(this.#endOfUtteranceTimer);
            this.#endOfUtteranceTimer = null;
        }
    };


    #onAgentStartSpeaking = () => {
        this.#agentSpeaking = true;
    };

    #onAgentStopSpeaking = () => {
        this.#agentSpeaking = false;
    };

    #onAgentInterrupted = () => {
        this.#agentSpeaking = false;
    };

    #scheduleEndOfUtterance(delay: number) {
        if (this.#endOfUtteranceTimer) {
            clearTimeout(this.#endOfUtteranceTimer);
            this.#endOfUtteranceTimer = null;
        }

        this.#endOfUtteranceTimer = setTimeout(() => {
            this.#handleEndOfTurn();
        }, delay);
    }

    #handleEndOfTurn() {
        console.log('End of turn detected — trigger action');

        let finalTranscript = this.#transcriptBuffer.trim();
        if (this.#backupTranscript.length > 0) {
            finalTranscript = (this.#backupTranscript + ' ' + finalTranscript).trim();
        }

        this.#backupTranscript = '';
        this.#transcriptBuffer = '';
        this.#transcriptSegments = [];

        this.#agentOutput.agentReplyTask(finalTranscript);
    }

    #onInterrupt = async () => {
        console.log('User interrupted, current transcript:', this.#transcriptBuffer);
        this.#backupTranscript = this.#transcriptBuffer;
        this.#transcriptBuffer = '';
        this.#transcriptSegments = [];

        if (this.#endOfUtteranceTimer) {
            clearTimeout(this.#endOfUtteranceTimer);
            this.#endOfUtteranceTimer = null;
        }

        this.#agentOutput.interrupt();
    }

    closeStream() {
        this.#userInput.close()
        const threadId = this.#agentOutput.close()
        return threadId
    }
}
