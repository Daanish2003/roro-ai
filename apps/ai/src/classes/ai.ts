import { config } from "../config/media-config.js";
import { Consumer } from "mediasoup/node/lib/ConsumerTypes.js";
import { Room } from "./room.js";
import { MediaKind, RtpCapabilities, RtpParameters } from "mediasoup/node/lib/rtpParametersTypes.js";
import { PlainTransport } from "mediasoup/node/lib/PlainTransportTypes.js";
import { DtlsParameters, WebRtcTransport } from "mediasoup/node/lib/WebRtcTransportTypes.js";
import { Producer } from "mediasoup/node/lib/ProducerTypes.js";

function generateUniqueSSRC(): number {

    return Math.floor(Math.random() * 0xffffffff) >>> 0;
  }

class Ai {
    private consumerTransport: WebRtcTransport | null = null;
    private plainTransport: PlainTransport | null = null;
    private rtpProducer: Producer | null
    private consumer: Consumer | null = null;
    public room: Room | null = null;

    constructor() {
        this.rtpProducer = null
        this.consumerTransport = null
        this.plainTransport = null
        this.consumer = null;
        this.room = null
    }

    public async createWebRtcTransport() {
        console.log("ai-start")
        if (!this.room?.router) {
          throw new Error("Router is not initialized for the room");
        }
        try {
          const transport = await this.room.router.createWebRtcTransport(config.mediasoup.webRtcTransport);
          const transportParams = {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
          };
    
         
            this.consumerTransport = transport;
    
          return transportParams;
        } catch (error) {
          console.error("Failed to create WebRTC transport", error);
          throw error;
        }
      }

      public async connectWebRtcTransport({
        dtlsParameters,
      }: {
        dtlsParameters: DtlsParameters;
      }): Promise<void> {
      
        try {
          console.log("Ai connect")
         
            if (!this.consumerTransport) {
                throw new Error("Consumer transport not initialized");
            }
              
            await this.consumerTransport.connect({ dtlsParameters });

        } catch (error) {
          console.error("Error connecting WebRTC transport:", error);
          throw error;
        }
      }

      

    public async createAiPlainTransport(
    ) {
        if(!this.room?.router) {
            throw new Error("Router is not initiailized for the room")
        }
        
        console.log("Ai Plain")

        try {
            this.plainTransport = await this.room.router.createPlainTransport(config.mediasoup.plainTransport)

            const clientTransportParams = {
                ip: this.plainTransport.tuple.localIp,
                port: this.plainTransport.tuple.localPort,
                rtcpPort: this.plainTransport.rtcpTuple?.localPort
            };

            return clientTransportParams
        } catch (error) {
            console.error("Failed to add transport", error)
            throw error
        }

    }

    public async connectPlainTransport(
        plainParams: { ip: string; port: number; rtcpPort: number | undefined }
      ): Promise<{ success: boolean }> {

        if (!this.plainTransport) {
          throw new Error("Plain transport not defined");
        }

        console.log("Ai Connect")
        try {
          await this.plainTransport.connect({
            ip: plainParams.ip,
            port: plainParams.port,
            rtcpPort: plainParams.rtcpPort,
          });
          return { success: true };
        } catch (error) {
          console.error("Failed to connect plain transport:", error);
          throw error;
        }
      }


    public async receiveExternalRtpMedia() {
        if (!this.plainTransport) {
          throw new Error("Plain transport not found");
        }
        if (!this.room || !this.room.router) {
          throw new Error("Room or router not found");
        }

        console.log("Ai-start")

        try {

            const routerCapabilities = this.room.router.rtpCapabilities;

            if(!routerCapabilities.codecs) {
                throw new Error("routerCapabitlites codecs not defined")
            }
            
            const opusCodec = routerCapabilities.codecs.find(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (c: any) => c.mimeType.toLowerCase() === "audio/opus"
            );
            if (!opusCodec) {
              throw new Error("OPUS codec not found in router capabilities");
            }

            const preferredPayloadType: number = opusCodec.preferredPayloadType || 111;
      
            const rtpParameters: RtpParameters = {
              codecs: [
                {
                  mimeType: opusCodec.mimeType,
                  clockRate: opusCodec.clockRate,
                  channels: opusCodec.channels || 2,
                  payloadType: preferredPayloadType,
                  rtcpFeedback: opusCodec.rtcpFeedback || [],
                  parameters: {}
                }
              ],
              headerExtensions: [], 
              encodings: [
                {
                  ssrc: generateUniqueSSRC()
                }
              ],
            };

            this.rtpProducer = await this.plainTransport.produce({
                kind: "audio",
                rtpParameters: rtpParameters,
              });

          this.rtpProducer.on("transportclose", () => {
            console.log("External RTP producer transport closed.");
            this.rtpProducer?.close();
          });

          return this.rtpProducer

        } catch (error) {
          console.error("Failed to receive external RTP media", error);
          throw error;
        }
      }
    
      public async consumeMedia({
        rtpCapabilities,
      }: {
        rtpCapabilities: RtpCapabilities;
      }): Promise<{
        producerId: string;
        id: string;
        kind: MediaKind;
        rtpParameters: RtpParameters;
      }> {

        console.log("Ai-consume")
        if (!this.rtpProducer) {
          throw new Error("No RTP producer available to consume");
        }
        if (!this.room || !this.room.router) {
          throw new Error("Room or router not available");
        }
        if (!this.room.router.canConsume({ producerId: this.rtpProducer.id, rtpCapabilities })) {
          throw new Error("Cannot consume the provided producer");
        }

        if (!this.consumerTransport) {
          throw new Error("Consumer transport not initialized");
        }


        try {
          this.consumer = await this.consumerTransport.consume({
            producerId: this.rtpProducer.id,
            rtpCapabilities,
            paused: true,
          });

          this.consumer.on("transportclose", () => {
            console.log("Consumer transport closed");
            this.consumer?.close();
          });

          return {
            producerId: this.rtpProducer.id,
            id: this.consumer.id,
            kind: this.consumer.kind,
            rtpParameters: this.consumer.rtpParameters,
          };
          
        } catch (error) {
          console.error("Error consuming media", error);
          throw error;
        }
      }
}

export default Ai;