import { Consumer, DirectTransport, Producer, RtpCapabilities } from "mediasoup/node/lib/types.js";

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
        
    
            return producerTrack
        }

        closeTrack() {
            this._agentConsumerTrack?.close()
            this.agentProducerTrack?.close()
        }

        get agentProducerTrack() {
            return this._agentProducerTrack
        }
    
        get agentConsumerTrack() {
            return this._agentConsumerTrack
        }
}