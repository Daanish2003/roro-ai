import { MediaKind, RtpCapabilities, RtpParameters } from "mediasoup/node/lib/rtpParametersTypes.js"
import { transportManager } from "../managers/media-transport-manager.js"
import { trackManager } from "../managers/media-track-manager.js"
import { DirectTransport } from "mediasoup/node/lib/DirectTransportTypes.js"
import { routerManager } from "../managers/media-router-manager.js"
import { Consumer } from "mediasoup/node/lib/ConsumerTypes.js"

export const produceTrack = async ({ kind, rtpParameters, transportId} :{
    kind: MediaKind,
    rtpParameters: RtpParameters,
    transportId: string
}) => {
    const transport = transportManager.getClientTransport(transportId)
    const producer = await transport!.produce({
        kind,
        rtpParameters
    })

    producer.on("transportclose", () => {
        console.log("Producer transport closed");
        producer?.close();
    });

    trackManager.addProducerTrack(producer)

    return producer.id
}

export const listenerTrack = async ({ transport, routerId, trackId}: {
    transport: DirectTransport,
    routerId: string,
    trackId: string
}) => {
    const rtpCap = await routerManager.getRouterRtpCap(routerId)
    const listenerTrack = await transport.consume({
        producerId: trackId,
        rtpCapabilities: rtpCap,
        paused: false
    })

    trackManager.addListenerTrack(listenerTrack)

    return listenerTrack
}

export const agentTrack = async ({ transport, listenerTrack}: {
    transport: DirectTransport,
    listenerTrack: Consumer
}) => {

    const producerTrack = await transport.produce({
        kind: 'audio',
        rtpParameters: listenerTrack.rtpParameters
    })

    trackManager.addAgentTrack(producerTrack)
}

export async function ConsumerTrack(routerId: string, trackId: string, rtpCap: RtpCapabilities, transportId: string) {
    try {
        const router = routerManager.getRouter(routerId)
        const transport = transportManager.getWebRTCTransport(transportId)
        const response = router!.canConsume({ producerId: trackId, rtpCapabilities: rtpCap})

        if(!response) {
            return { message: "Cannot consume" };
        }

        if(!transport) {
            throw new Error("ConsumeRequest: consumer transport not found");
        }

        try {
            const consumer = await transport.consume({
              producerId: trackId,
              rtpCapabilities: rtpCap,
              paused: true,
            });
      
      
            if(!consumer) {
              throw new Error("Consumer not created");
            }
      
            consumer.on("transportclose", () => {
              console.log("Consumer transport closed");
              consumer?.close();
            });
      
            consumer.on("score", (score) => {
              console.log(score)
            })
      
            const consumerParams = {
              producerId: trackId,
              id: consumer.id,
              kind: consumer.kind,
              rtpParameters: consumer.rtpParameters,
            };
      
            return { consumerParams };
          } catch (error) {
            console.error("Error consuming media", error);
            throw error;
          }
    } catch (error) {
        throw new Error(`Failed to check for consume for ${trackId} : ${error}`)
    }
}
