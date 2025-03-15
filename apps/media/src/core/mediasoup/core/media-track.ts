import { Consumer, MediaKind, Producer, Router, RtpCapabilities, RtpParameters, WebRtcTransport } from "mediasoup/node/lib/types.js";
import { trackManager } from "../managers/media-track-manager.js";

export class MediaTrack {
    constructor(
            private _clientProducerTrack: Producer | null = null,
            private _clientConsumerTrack: Consumer | null = null,
    ) {}

    async createClientProducerTrack({
        kind,
        rtpParameters,
        transport
    }: {
        kind: MediaKind,
        rtpParameters: RtpParameters,
        transport: WebRtcTransport
    }) {
            const producer = await transport!.produce({
                kind,
                rtpParameters
            })
        
            producer.on("transportclose", () => {
                console.log("Producer transport closed");
                producer?.close();
            });

            this._clientProducerTrack = producer
        
            trackManager.addProducerTrack(producer)
        
            return producer.id
    }

    async createClientConsumerTrack({
        rtpCap,
        transport,
        trackId,
        router
    }: {
        rtpCap: RtpCapabilities,
        transport: WebRtcTransport,
        trackId: string,
        router: Router
    }) {
            try {
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

                        this._clientConsumerTrack = consumer
                  
                        consumer.on("transportclose", () => {
                          console.log("Consumer transport closed");
                          consumer?.close();
                        });
                  
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

    

    async unpauseConsumer() {
        try {
            await this._clientConsumerTrack!.resume();
            
            return { success: true};
          } catch (error) {
            console.error("Failed to unpause consumer", error);
            throw error;
          }
    }

    get clientProducerTrack() {
        return this._clientProducerTrack
    }

    get clientConsumerTrack() {
        return this._clientConsumerTrack
    }
}