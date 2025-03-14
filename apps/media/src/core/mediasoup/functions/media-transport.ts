import { config } from "../../config/media-config.js";
import { DtlsParameters } from "mediasoup/node/lib/WebRtcTransportTypes.js";
import { transportManager } from "../managers/media-transport-manager.js";
import { routerManager } from "../managers/media-router-manager.js";

export const createWebRTCTransport = async (routerId: string) => {
    try {
        const router = routerManager.getRouter(routerId)

        if(!router) {
            throw new Error("Router is not created")
        }

        const transport = await router.createWebRtcTransport(config.mediasoup.webRtcTransport);
        const transportParams = {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
        };

        transportManager.addWebRTCTransport(transport)

        return transportParams
    } catch (error) {
        console.error("Failed to create WebRTC transport", error);
        throw error;
    }
}

export const connectWebRtcTransport = async (
    {
        transportId,
        dtlsParameters
    }: {
        transportId: string 
        dtlsParameters: DtlsParameters
    }
): Promise<void> => {
    try {
        const transport = transportManager.getWebRTCTransport(transportId)

        if(!transport) {
            throw new Error("WebRTC transport not found")
        }

        await transport.connect({ dtlsParameters });
        
    } catch (error) {
      console.error("Error connecting WebRTC transport:", error);
      throw error;
    }
}

export const createDirectTransport = async (routerId: string) => {
    try {
        const router = routerManager.getRouter(routerId)

        if(!router) {
            throw new Error("Router is not created")
        }

        const directTransport = await router.createDirectTransport();
        transportManager.addDirectTransport(directTransport)
        return directTransport
    } catch (error) {
        console.error("Failed to create Direct Transport", error);
        throw error;
    }
}