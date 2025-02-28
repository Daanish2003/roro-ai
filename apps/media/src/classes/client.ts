import { config } from "../config/media-config.js";
import { Producer } from "mediasoup/node/lib/ProducerTypes.js";
import { DtlsParameters, WebRtcTransport } from "mediasoup/node/lib/WebRtcTransportTypes.js";
import { Room } from "./room.js";
import { MediaKind, RtpCapabilities, RtpParameters } from "mediasoup/node/lib/rtpParametersTypes.js";
import { DirectTransport } from "mediasoup/node/lib/DirectTransportTypes.js";
import { Consumer } from "mediasoup/node/lib/ConsumerTypes.js";
import { AiAgentPipeline } from "./ai-agent-pipeline.js";
import * as RTPParser from 'rtp-parser';
import WebSocket from "ws";



class Client {
  private userId: string;
  private username: string;
  private directTransport: DirectTransport | null = null;
  private directTransportConsumer: Consumer | null = null;
  private consumerTransport: WebRtcTransport | null = null;
  public directTransportProducer: Producer | null = null;
  private consumer: Consumer | null = null;
  private producerTransport: WebRtcTransport | null = null;
  public prompt: string
  private ws: WebSocket | null
  private clientProducer: Producer | null = null;
  public room: Room | null = null;




  constructor(username: string, userId: string, prompt: string) {
    this.userId = userId;
    this.username = username;
    this.prompt= prompt;
    this.ws = null
  }

  public async createConsumerTransport() {
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

  public async connectConsumerTransport({
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
        
    } catch (error) {
      console.error("Error connecting WebRTC transport:", error);
      throw error;
    }
  }

  private async createAiDirectTransport() {
    if (!this.room?.router) {
        throw new Error("Router is not initialized for the room");
    }
    console.log("Ai: Creating Direct Transport for Deepgram");
    try {
        const directTransport = await this.room.router.createDirectTransport();
        console.log("Ai: Direct Transport created");
        return directTransport
    } catch (error) {
        console.error("Failed to create Direct Transport", error);
        throw error;
    }
  }

  public async produceMedia({
    kind,
    rtpParameters,
  }: {
    kind: MediaKind;
    rtpParameters: RtpParameters;
  }) {
    if (!this.producerTransport) {
      throw new Error("Producer transport not initialized");
    }
    if (!this.room) {
      throw new Error("Room not found");
    }

    if(!this.room.router) {
      throw new Error("Router not initialized")
    }

    try {
      console.log("client produce")
      this.clientProducer = await this.producerTransport.produce({ kind, rtpParameters });

      this.clientProducer.on("transportclose", () => {
        console.log("Producer transport closed");
        this.clientProducer?.close();
      });

      this.directTransport = await this.createAiDirectTransport();

     if (!this.directTransport) {
      throw new Error("Direct Transport for Deepgram failed to initialize");
     }

     const aiAgentPipeline = new AiAgentPipeline(this.prompt, this.room)


      this.directTransportConsumer = await this.directTransport.consume({
        producerId: this.clientProducer.id,
        rtpCapabilities: this.room.router.rtpCapabilities,
        paused: false,
      })

      this.directTransportProducer = await this.directTransport.produce({
        kind: this.directTransportConsumer.kind,
        rtpParameters: this.directTransportConsumer.rtpParameters
      })

      if(!this.directTransportConsumer) {
         throw new Error("Direct Transport Consumer for Deepgram failed to initialize");
      }

      this.directTransportConsumer.on("transportclose", () => {
        console.log("DirectTransport Consumer transport closed.");
      })

      const dgSocket = aiAgentPipeline.deepgramSTT.createConnection()
      

      this.directTransportConsumer.on("rtp", async (rtpPackets) => {
        if(!dgSocket) {
           throw new Error("Deepgram socket not initailized")
        }
        const parserRtp = RTPParser.parseRtpPacket(rtpPackets);
        let audioFrame = parserRtp.payload;

        if (parserRtp.extension) {
           const extHeader = audioFrame.slice(0, 4);
           const extLengthWords = extHeader.readUInt16BE(2);
           const totalExtSize = 4 + extLengthWords * 4;
           audioFrame = audioFrame.slice(totalExtSize);
        }


        aiAgentPipeline.deepgramSTT.sendAudio(audioFrame);
      })


      this.directTransportProducer.on("listenererror", (error) => {
        console.error(error)
      })

      this.directTransportProducer.on("score", (score) => {
        console.log(score)
      })

      this.directTransportProducer.on('trace', (trace) => {
        console.log(trace)
      })


      aiAgentPipeline.deepgramTTS.setDirectTransportProducer(this.directTransportProducer)

      
      return this.clientProducer.id
    } catch (error) {
      console.error("Error producing media", error);
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
    if (!this.directTransportProducer) {
      return { message: "direct Producer not found" };
    }
    if (!this.consumerTransport) {
      throw new Error("Consumer transport not initialized");
    }
    if (!this.room?.router?.canConsume({ producerId: this.directTransportProducer.id, rtpCapabilities })) {
      return { message: "Cannot consume" };
    }

    try {
      this.consumer = await this.consumerTransport.consume({
        producerId: this.directTransportProducer.id,
        rtpCapabilities,
        paused: true,
      });

      console.log("Consume Paused:", this.consumer.paused);

      if(!this.consumer) {
        throw new Error("Consumer not created");
      }

      this.consumer.on("transportclose", () => {
        console.log("Consumer transport closed");
        this.consumer?.close();
      });

      this.consumer.on("score", (score) => {
        console.log(score)
      })

      const consumerParams = {
        producerId: this.directTransportProducer.id,
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
}

export default Client;
