import { config } from "../config/media-config.js";
import { Consumer } from "mediasoup/node/lib/ConsumerTypes.js";
import { Room } from "./room.js";
import { MediaKind, RtpCapabilities, RtpParameters } from "mediasoup/node/lib/rtpParametersTypes.js";
import { PlainTransport } from "mediasoup/node/lib/PlainTransportTypes.js";
import { DtlsParameters, WebRtcTransport } from "mediasoup/node/lib/WebRtcTransportTypes.js";
import { Producer } from "mediasoup/node/lib/ProducerTypes.js";

class Ai {
  private consumerTransport: WebRtcTransport | null = null;
  private plainTransport: PlainTransport | null = null;
  private rtpProducer: Producer | null = null;
  private consumer: Consumer | null = null;
  public room: Room | null = null;

  constructor() {}

  public async createWebRtcTransport() {
    console.log("Ai: Starting WebRTC transport creation");
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
    console.log("Ai: Connecting WebRTC transport");
    if (!this.consumerTransport) {
      throw new Error("Consumer transport not initialized");
    }
    try {
      await this.consumerTransport.connect({ dtlsParameters });
      console.log("Ai: WebRTC transport connected");
    } catch (error) {
      console.error("Error connecting WebRTC transport:", error);
      throw error;
    }
  }

  public async createAiPlainTransport() {
    if (!this.room?.router) {
      throw new Error("Router is not initialized for the room");
    }
    console.log("Ai: Creating plain transport");
    try {
      this.plainTransport = await this.room.router.createPlainTransport(config.mediasoup.plainTransport);
      const clientTransportParams = {
        ip: this.plainTransport.tuple.localIp,
        port: this.plainTransport.tuple.localPort,
        rtcpPort: this.plainTransport.rtcpTuple?.localPort,
      };
      return clientTransportParams;
    } catch (error) {
      console.error("Failed to create plain transport", error);
      throw error;
    }
  }

  
  public async connectPlainTransport(
    plainParams: { ip: string; port: number; rtcpPort: number | undefined }
  ): Promise<{ success: boolean }> {
    if (!this.plainTransport) {
      throw new Error("Plain transport not defined");
    }
    console.log("Ai: Connecting plain transport");
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

  public async receiveExternalRtpMedia(rtpParameters: RtpParameters) {
    if (!this.plainTransport) {
      throw new Error("Plain transport not found");
    }
    if (!this.room || !this.room.router) {
      throw new Error("Room or router not found");
    }
    console.log("Ai: Receiving external RTP media");
    try {
      this.rtpProducer = await this.plainTransport.produce({
        kind: "audio",
        rtpParameters: rtpParameters,
      });

      console.log("Ai: RTP paused", this.rtpProducer.paused);
      

      this.rtpProducer.on("transportclose", () => {
        console.log("External RTP producer transport closed.");
        this.rtpProducer?.close();
      });

      return this.rtpProducer;
    } catch (error) {
      console.error("Failed to receive external RTP media", error);
      throw error;
    }
  }

  public async unpauseConsumer() {
    if (!this.consumer) {
      throw new Error("Consumer not found");
    }
    console.log("Ai: Unpausing consumer");
    try {
      await this.consumer.resume();
     
      console.log("Consumer paused:", this.consumer.paused);
      
      return { success: true};
    } catch (error) {
      console.error("Failed to unpause consumer", error);
      throw error;
    }
  }

  public async consumeMedia({
    rtpCapabilities,
  }: {
    rtpCapabilities: RtpCapabilities;
  }): Promise<
    | {
        consumerParams: {
          producerId: string;
          id: string;
          kind: MediaKind;
          rtpParameters: RtpParameters;
        };
      }
    | { message: string }
  > {
    console.log("Ai: Starting media consumption");
    if (!this.rtpProducer) {
      return { message: "Producer not found" };
    }
    if (!this.consumerTransport) {
      throw new Error("Consumer transport not initialized");
    }
    if (!this.room?.router?.canConsume({ producerId: this.rtpProducer.id, rtpCapabilities })) {
      return { message: "Cannot consume" };
    }

    try {
      this.consumer = await this.consumerTransport.consume({
        producerId: this.rtpProducer.id,
        rtpCapabilities,
        paused: true,
      });

      console.log("Consume Paused:", this.consumer.paused);

      if(!this.consumer) {
        throw new Error("Consumer not created");
      }

      setInterval(async() => {
        console.log("Producer stats", await this.consumer?.getStats());
      }, 3000)

      this.consumer.on("transportclose", () => {
        console.log("Consumer transport closed");
        this.consumer?.close();
      });


      const consumerParams = {
        producerId: this.rtpProducer.id,
        id: this.consumer.id,
        kind: this.consumer.kind,
        rtpParameters: this.consumer.rtpParameters,
      };

      return { consumerParams };
    } catch (error) {
      console.error("Error consuming media", error);
      throw error;
    }
  }
}

export default Ai;
