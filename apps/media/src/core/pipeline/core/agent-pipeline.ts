import { v4 as uuidv4 } from 'uuid';
import { RtpCapabilities } from 'mediasoup/node/lib/rtpParametersTypes.js';
import { AgentTrack } from './agent-track.js';
import { DirectTransport } from 'mediasoup/node/lib/DirectTransportTypes.js';
import { AudioInputStream } from '../../audio/audio-stream.js';

export class AgentPipeline {
    public readonly agentId: string;
    private transport: DirectTransport | null = null
    public mediaTracks: AgentTrack;
    private audioStream: AudioInputStream | null = null;
    
    constructor() {
        this.agentId = uuidv4();
        this.mediaTracks = new AgentTrack();
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

        if (!this.audioStream) {
            this.audioStream = new AudioInputStream();
        }

        track.on('rtp', (rtpPackets) => {
            console.log(rtpPackets)
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