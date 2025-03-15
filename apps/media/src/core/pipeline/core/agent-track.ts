import { Consumer, DirectTransport, Producer, RtpCapabilities } from "mediasoup/node/lib/types.js";
import { trackManager } from "../../mediasoup/managers/media-track-manager.js";

export class AgentTrack {
    constructor(
                private _agentProducerTrack: Producer | null = null,
                private _agentConsumerTrack: Consumer | null = null,
        ) {}

        async createAgentConsumerTrack({
            rtpCap,
            transport,
            trackId
        }: {
            rtpCap: RtpCapabilities,
            transport: DirectTransport,
            trackId: string
        }) {
                const consumer = await transport.consume({
                    producerId: trackId,
                    rtpCapabilities: rtpCap,
                    paused: false
                })
    
                this._agentConsumerTrack = consumer
            
                trackManager.addListenerTrack(consumer)

                return consumer
        }
    
        async createAgentProducerTrack({ transport, listenerTrack}: {
            transport: DirectTransport,
            listenerTrack: Consumer
        }){
        
            const producerTrack = await transport.produce({
                kind: 'audio',
                rtpParameters: listenerTrack.rtpParameters
            })
    
            this._agentProducerTrack = producerTrack
        
            trackManager.addAgentTrack(producerTrack)
    
            return producerTrack
        }

        get agentProducerTrack() {
            return this._agentProducerTrack
        }
    
        get agentConsumerTrack() {
            return this._agentConsumerTrack
        }
}