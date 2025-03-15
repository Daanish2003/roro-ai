import { DirectTransport } from "mediasoup/node/lib/DirectTransportTypes.js"
import { WebRtcTransport } from "mediasoup/node/lib/WebRtcTransportTypes.js"

class MediasoupTransportManager {
    private static instance: MediasoupTransportManager
    private clientTransports: Map<string, WebRtcTransport>
    private agentTransports: Map<string, DirectTransport>

    constructor() {
        this.clientTransports = new Map()
        this.agentTransports = new Map()
    }

    static getInstance() {
        if(!MediasoupTransportManager.instance) {
            MediasoupTransportManager.instance = new MediasoupTransportManager()
        }

        return MediasoupTransportManager.instance
    }

    addClientTransport(transport: WebRtcTransport) {
        this.clientTransports.set(transport.id, transport)
    }

    addAgentTransport(transport: DirectTransport) {
        this.agentTransports.set(transport.id, transport)
    }

    getClientTransport(transportId: string) {
        return this.clientTransports.get(transportId)
    }

    getAgentTransport(transportId: string) {
        return this.agentTransports.get(transportId)
    }

    hasClientTransport(transportId: string) {
        return this.clientTransports.has(transportId)
    }

    hasAgentTransport(transportId: string) {
        return this.agentTransports.has(transportId)
    }
}

export const transportManager = MediasoupTransportManager.getInstance()