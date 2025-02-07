import { config } from "../config/media-config.js";
import { Consumer } from "mediasoup/node/lib/ConsumerTypes.js";
import { Producer } from "mediasoup/node/lib/ProducerTypes.js";
import { DtlsParameters, WebRtcTransport } from "mediasoup/node/lib/WebRtcTransportTypes.js";
import { Room } from "./room.js";
import { MediaKind, RtpCapabilities, RtpCodecCapability, RtpCodecParameters, RtpParameters } from "mediasoup/node/lib/rtpParametersTypes.js";
import { PlainTransport } from "mediasoup/node/lib/PlainTransportTypes.js";

class Client {
  private userId: string;
  private username: string;
  private producerTransport: WebRtcTransport | null = null;
  private consumerTransport: WebRtcTransport | null = null;
  private plainTransport: PlainTransport | null = null;
  private plainTransportParams: {
    ip: string,
    port: number,
    rtcpPort: number | undefined 
  } | null = null;
  private clientProducer: Producer | null = null;
  private rtpProducer: Producer | null = null;
  private consumer: Consumer | null = null;
  public room: Room | null = null;

  constructor(username: string, userId: string) {
    this.userId = userId;
    this.username = username;
  }

  /*========================================================================
    1. CLIENT-TO-SERVER: Create and Connect WebRTC Transports
  =========================================================================*/
  // Create a WebRTC transport for either producing (sending) or consuming media.
  public async createWebRtcTransport(type: 'producer' | 'consumer') {
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

      if (type === "producer") {
        this.producerTransport = transport;
      } else {
        this.consumerTransport = transport;
      }

      if (!this.plainTransport) {
        await this.createPlainTransport();
      }
      return transportParams;
    } catch (error) {
      console.error("Failed to create WebRTC transport", error);
      throw error;
    }
  }

  // Connect a WebRTC transport using remote DTLS parameters.
  public async connectWebRtcTransport({
    dtlsParameters,
    type,
  }: {
    dtlsParameters: DtlsParameters;
    type: 'producer' | 'consumer';
  }): Promise<void> {
    try {
      if (type === 'producer') {
        if (!this.producerTransport)
          throw new Error("Producer transport not initialized");
        await this.producerTransport.connect({ dtlsParameters });
        
        // After connecting the WebRTC transport, connect the plain transport (RTP forwarding).
        if (!this.plainTransportParams)
          throw new Error("Plain transport parameters not available");
        await this.connectPlainTransport(this.plainTransportParams);
      } else {
        if (!this.consumerTransport)
          throw new Error("Consumer transport not initialized");
        await this.consumerTransport.connect({ dtlsParameters });
      }
    } catch (error) {
      console.error("Error connecting WebRTC transport:", error);
      throw error;
    }
  }

  /*========================================================================
    2. SERVER-INTERNAL: RTP Forwarding via Plain Transport
  =========================================================================*/
  // Create a plain transport for RTP (used for server-to-server forwarding or external RTP endpoints).
  public async createPlainTransport(): Promise<void> {
    if (!this.room?.router) {
      throw new Error("Router is not initialized for the room");
    }
    try {
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
    } catch (error) {
      console.error("Error creating plain transport:", error);
      throw error;
    }
  }

  // Connect the plain transport to its remote endpoint.
  public async connectPlainTransport(
    plainParams: { ip: string; port: number; rtcpPort: number | undefined }
  ): Promise<{ success: boolean }> {
    if (!this.plainTransport) {
      throw new Error("Plain transport not defined");
    }
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

  // Forward the client’s producer (from the WebRTC transport) into the RTP flow
  // using the plain transport. (This “pipes” the RTP packets.)
  public async forwardProducerToPlainTransport(producer: Producer): Promise<{
    producerId: string;
    consumerId: string;
    kind: MediaKind;
    rtpParameters: RtpParameters;
  }> {
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

  /*========================================================================
    3. CLIENT-TO-SERVER-TO-SERVER-TO-CLIENT: Produce, Forward & Consume
  =========================================================================*/
  // Produce media from the client using the WebRTC transport and forward it to the RTP flow.
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

  public async receiveExternalRtpMedia(): Promise<void> {
    if (!this.plainTransport) {
      throw new Error("Plain transport not found");
    }
    if (!this.room || !this.room.router) {
      throw new Error("Room or router not found");
    }
    try {
      const codecs = this.room.router.rtpCapabilities.codecs as RtpCodecCapability[];
      this.rtpProducer = await this.plainTransport.produce({
        kind: "audio",
        rtpParameters: {
          codecs: codecs.map(
            (codec) => ({ ...codec, payloadType: 100 } as RtpCodecParameters)
          ),
          encodings: [{ ssrc: Math.floor(Math.random() * 1000000) }],
        },
      });
      this.rtpProducer.on("transportclose", () => {
        console.log("External RTP producer transport closed.");
        this.rtpProducer?.close();
      });
    } catch (error) {
      console.error("Failed to receive external RTP media", error);
      throw error;
    }
  }

  // Consume the (forwarded) media using the consumer WebRTC transport.
  // This “pipes” the media back to the client.
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
        paused: true, // start paused; resume when client is ready
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

export default Client;
