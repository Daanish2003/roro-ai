import { v4 as uuidv4 } from 'uuid';
import { RtpCapabilities } from 'mediasoup/node/lib/rtpParametersTypes.js';
import { AgentTrack } from './agent-track.js';
import { DirectTransport } from 'mediasoup/node/lib/DirectTransportTypes.js';
import { DeepgramSTT } from './deepgramSTT.js';
import { VAD } from '../../vad/core/vad.js';
import { EventEmitter } from 'node:events';
import { Audio } from '../../audio/core/audio.js';

export class AgentPipeline extends EventEmitter {
    public readonly agentId: string;
    private transport: DirectTransport | null = null
    public mediaTracks: AgentTrack;
    private audio: Audio | null = null
    private deepgramSTT: DeepgramSTT;
    private vad: VAD

    constructor(vad: VAD) {
        super();
        this.agentId = uuidv4();
        this.vad = vad
        this.mediaTracks = new AgentTrack();
        this.deepgramSTT = new DeepgramSTT();
    }

    setTransport(transport: DirectTransport){
        this.transport = transport
    }

    async subscribeTrack(trackId: string, rtpCap: RtpCapabilities) {
        const track = await this.mediaTracks.createAgentConsumerTrack({
            transport: this.transport!,
            rtpCap: rtpCap,
            trackId,
        })

        this.audio = await Audio.create({
            channel: 1,
            sampleRate: 16000,
            samplesPerChannel: 512
        })

        const audioStream = this.audio.stream()

        track.on('rtp', async (rtpPackets) => {
            audioStream.pushStream(rtpPackets)
            for await (const frame of audioStream) {
                console.log(frame)
            }
        })
    }

    async publishTrack() {
        const track = await this.mediaTracks.createAgentProducerTrack({
            transport: this.transport!,
            listenerTrack: this.mediaTracks.agentConsumerTrack!,
        })

        return track.id
    }
}