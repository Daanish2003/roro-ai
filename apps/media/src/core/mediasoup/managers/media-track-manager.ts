import { Consumer, Producer } from "mediasoup/node/lib/types.js"

class MediasoupTrackManager {
    private static instance: MediasoupTrackManager
    private producerTrack: Map<string, Producer>
    private consumerTrack: Map<string, Consumer>
    private listenerTrack: Map<string, Consumer>
    private agentTrack: Map<string, Producer>

    constructor() {
        this.producerTrack = new Map()
        this.consumerTrack = new Map()
        this.listenerTrack = new Map()
        this.agentTrack = new Map()
    }

    static getInstance() {
        if(!MediasoupTrackManager.instance) {
            MediasoupTrackManager.instance = new MediasoupTrackManager()
        }

        return MediasoupTrackManager.instance
    }

    addProducerTrack(track: Producer) {
        this.producerTrack.set(track.id, track)
    }

    addConsumerTrack(track: Consumer) {
        this.consumerTrack.set(track.id, track)
    }

    getProducerTrack(trackId: string) {
        return this.producerTrack.get(trackId)
    }

    getConsumerTrack(trackId: string) {
        return this.consumerTrack.get(trackId)
    }

    hasProducerTrack(trackId: string) {
        return this.producerTrack.has(trackId)
    }

    hasConsumerTrack(trackId: string) {
        return this.consumerTrack.has(trackId)
    }

    addListenerTrack(track: Consumer) {
        this.listenerTrack.set(track.id, track)
    }

    addAgentTrack(track: Producer) {
        this.agentTrack.set(track.id, track)
    }

    getListenerTrack(trackId: string) {
        this.listenerTrack.get(trackId)
    }

    getAgentTrack(trackId: string) {
        this.agentTrack.get(trackId)
    }

    hasListenerTrack(trackId: string) {
        this.listenerTrack.has(trackId)
    }

    hasAgentTrack(trackId: string) {
        this.agentTrack.has(trackId)
    }
}

export const trackManager = MediasoupTrackManager.getInstance()