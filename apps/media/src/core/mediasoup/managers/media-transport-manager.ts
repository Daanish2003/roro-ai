import { DirectTransport } from "mediasoup/node/lib/DirectTransportTypes.js"
import { WebRtcTransport } from "mediasoup/node/lib/WebRtcTransportTypes.js"

class MediasoupTransportManager {
    private static instance: MediasoupTransportManager
    private webRTCTransport: Map<string, WebRtcTransport>
    private directTransport: Map<string, DirectTransport>

    constructor() {
        this.webRTCTransport = new Map()
        this.directTransport = new Map()
    }

    static getInstance() {
        if(!MediasoupTransportManager.instance) {
            MediasoupTransportManager.instance = new MediasoupTransportManager()
        }

        return MediasoupTransportManager.instance
    }

    addWebRTCTransport(transport: WebRtcTransport) {
        this.webRTCTransport.set(transport.id, transport)
    }

    addDirectTransport(transport: DirectTransport) {
        this.directTransport.set(transport.id, transport)
    }

    getWebRTCTransport(transportId: string) {
        return this.webRTCTransport.get(transportId)
    }

    getDirectTransport(transportId: string) {
        return this.directTransport.get(transportId)
    }

    hasWebRTCTransport(transportId: string) {
        return this.webRTCTransport.has(transportId)
    }

    hasDirectTransport(transportId: string) {
        return this.directTransport.has(transportId)
    }
}

export const transportManager = MediasoupTransportManager.getInstance()