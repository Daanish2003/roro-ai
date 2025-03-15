import { DirectTransport } from 'mediasoup/node/lib/DirectTransportTypes.js';
import { DtlsParameters, WebRtcTransport } from 'mediasoup/node/lib/WebRtcTransportTypes.js';
import { config } from '../../config/media-config.js';
import { transportManager } from '../managers/media-transport-manager.js';
import { Router } from 'mediasoup/node/lib/RouterTypes.js';

export class MediaTransport {
    constructor(
        private _clientProducerTransport: WebRtcTransport | null = null,
        private _clientConsumerTransport: WebRtcTransport | null = null,
        private _agentTransport: DirectTransport | null = null,
    ) {}

    async createClientProducerTransport(router: Router){
        try {
                const transport = await router.createWebRtcTransport(config.mediasoup.webRtcTransport);
                const transportParams = {
                    id: transport.id,
                    iceParameters: transport.iceParameters,
                    iceCandidates: transport.iceCandidates,
                    dtlsParameters: transport.dtlsParameters,
                };
        
                this._clientProducerTransport = transport

                transportManager.addClientTransport(transport)
        
                return transportParams
            } catch (error) {
                console.error("Failed to create WebRTC transport", error);
                throw error;
            }
    }

    async connectClientProducerTransport({
        dtlsParameters
    }: {
        dtlsParameters: DtlsParameters
    }) {
        try {
        
            if(!this._clientProducerTransport) {
                throw new Error("WebRTC transport not found")
            }
        
            await this._clientProducerTransport.connect({ dtlsParameters });
                
            } catch (error) {
              console.error("Error connecting WebRTC transport:", error);
              throw error;
            }
    }

    async createClientConsumerTransport(router: Router){
        try {
                const transport = await router.createWebRtcTransport(config.mediasoup.webRtcTransport);
                const transportParams = {
                    id: transport.id,
                    iceParameters: transport.iceParameters,
                    iceCandidates: transport.iceCandidates,
                    dtlsParameters: transport.dtlsParameters,
                };
        
                this._clientConsumerTransport = transport

                transportManager.addClientTransport(transport)
        
                return transportParams
            } catch (error) {
                console.error("Failed to create WebRTC transport", error);
                throw error;
            }
    }

    async connectClientConsumerTransport({
        dtlsParameters
    }: {
        dtlsParameters: DtlsParameters
    }) {
        try {
        
            if(!this._clientConsumerTransport) {
                throw new Error("WebRTC transport not found")
            }
        
            await this._clientConsumerTransport.connect({ dtlsParameters });
                
            } catch (error) {
              console.error("Error connecting WebRTC transport:", error);
              throw error;
            }
    }

    async createAgentTransport(router: Router) {
        try {
            const directTransport = await router.createDirectTransport();
            this._agentTransport = directTransport
            transportManager.addAgentTransport(directTransport)
            return directTransport
        } catch (error) {
            console.error("Failed to create Direct Transport", error);
            throw error;
        }
    }


    get clientProducerTransport() {
        return this._clientProducerTransport
    }

    get clientConsumerTransport() {
        return this._clientConsumerTransport
    }

    get directTransport() {
        return this._agentTransport
    }
}