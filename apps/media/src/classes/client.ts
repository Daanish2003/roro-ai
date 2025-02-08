import { config } from "../config/media-config.js";
import { Producer } from "mediasoup/node/lib/ProducerTypes.js";
import { DtlsParameters, WebRtcTransport } from "mediasoup/node/lib/WebRtcTransportTypes.js";
import { Room } from "./room.js";
import { MediaKind, RtpParameters } from "mediasoup/node/lib/rtpParametersTypes.js";
import { PlainTransport } from "mediasoup/node/lib/PlainTransportTypes.js";

class Client {
  private userId: string;
  private username: string;
  private producerTransport: WebRtcTransport | null = null;
  private plainTransport: PlainTransport | null = null;
  private plainTransportParams: {
    ip: string,
    port: number,
    rtcpPort: number | undefined 
  } | null = null;
  private clientProducer: Producer | null = null;
  public room: Room | null = null;

  constructor(username: string, userId: string) {
    this.userId = userId;
    this.username = username;
  }


  public async createWebRtcTransport() {
    if (!this.room?.router) {
      throw new Error("Router is not initialized for the room");
    }
    try {
      console.log("client-tranport")
      const transport = await this.room.router.createWebRtcTransport(config.mediasoup.webRtcTransport);
      const transportParams = {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      };

  
        this.producerTransport = transport;

        
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
        console.log("client connect transport")

        if (!this.producerTransport)
          throw new Error("Producer transport not initialized");
        await this.producerTransport.connect({ dtlsParameters });
        
        if (!this.plainTransportParams) {
          throw new Error("Plain Transport not found")
        }
    } catch (error) {
      console.error("Error connecting WebRTC transport:", error);
      throw error;
    }
  }


  public async createPlainTransport() {
    if (!this.room?.router) {
      throw new Error("Router is not initialized for the room");
    }
    try {
      console.log("client plain Transport")
      this.plainTransport = await this.room.router.createPlainTransport(config.mediasoup.plainTransport);
      this.plainTransportParams = {
        ip: this.plainTransport.tuple.localIp,
        port: this.plainTransport.tuple.localPort,
        rtcpPort: this.plainTransport.rtcpTuple?.localPort,
      };

      this.plainTransport.on('tuple', (tuple) => {
        console.log('Plain transport RTP tuple:', tuple);
      });
      this.plainTransport.on('rtcptuple', (tuple) => {
        console.log('Plain transport RTCP tuple:', tuple);
      });

      return this.plainTransportParams
    } catch (error) {
      console.error("Error creating plain transport:", error);
      throw error;
    }
  }


  public async forwardProducerToPlainTransport(producer: Producer): Promise<{
    producerId: string;
    consumerId: string;
    kind: MediaKind;
    rtpParameters: RtpParameters;
  }> {
    console.log("client - forward")
    if (!this.plainTransport) {
      throw new Error("Plain transport not available");
    }
    if (!this.room?.router) {
      throw new Error("Room or router not available");
    }
    try {
      const plainConsumer = await this.plainTransport.consume({
        producerId: producer.id,
        rtpCapabilities: this.room.router.rtpCapabilities,
      });
      return {
        producerId: producer.id,
        consumerId: plainConsumer.id,
        kind: producer.kind,
        rtpParameters: plainConsumer.rtpParameters,
      };
    } catch (error) {
      console.error("Failed to forward producer to plain transport", error);
      throw error;
    }
  }

  public async produceMedia({
    kind,
    rtpParameters,
  }: {
    kind: MediaKind;
    rtpParameters: RtpParameters;
  }): Promise<string> {
    if (!this.producerTransport) {
      throw new Error("Producer transport not initialized");
    }
    if (!this.room) {
      throw new Error("Room not found");
    }
    try {
      console.log("client produce")
      this.clientProducer = await this.producerTransport.produce({ kind, rtpParameters });
      this.clientProducer.on("transportclose", () => {
        console.log("Producer transport closed");
        this.clientProducer?.close();
      });
      
      await this.forwardProducerToPlainTransport(this.clientProducer);
      return this.clientProducer.id;
    } catch (error) {
      console.error("Error producing media", error);
      throw error;
    }
  }
}

export default Client;
