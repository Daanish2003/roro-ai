import { RtpCapabilities } from "mediasoup/node/lib/rtpParametersTypes.js";
import { trackManager } from "../managers/media-track-manager.js";
import { routerManager } from "../managers/media-router-manager.js";
import { transportManager } from "../managers/media-transport-manager.js";

export async function unpauseConsumer(trackId: string) {
    try {
      const track = trackManager.getConsumerTrack(trackId)

      await track!.resume();
      
      return { success: true};
    } catch (error) {
      console.error("Failed to unpause consumer", error);
      throw error;
    }
}

export async function Consume(routerId: string, trackId: string, rtpCap: RtpCapabilities, transportId: string) {
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