import {
  Consumer,
  DirectTransport,
  MediaKind,
  Producer,
  Router,
  RtpCapabilities,
  RtpParameters,
  WebRtcTransport
} from "mediasoup/node/lib/types.js";

export class MediaTrack {
  constructor(
    private _clientProducerTrack: Producer | null = null,
    private _clientConsumerTrack: Consumer | null = null,
    private _agentProducerTrack: Producer | null = null,
    private _agentConsumerTrack: Consumer | null = null
  ) {}

  async createClientProducerTrack({
    kind,
    rtpParameters,
    transport
  }: {
    kind: MediaKind;
    rtpParameters: RtpParameters;
    transport: WebRtcTransport;
  }) {
    const producer = await transport.produce({
      kind,
      rtpParameters
    });

    producer.on("transportclose", () => {
      console.log("Producer transport closed");
      producer.close();
    });

    this._clientProducerTrack = producer;

    return producer.id;
  }

  async createClientConsumerTrack({
    rtpCap,
    transport,
    trackId,
    router
  }: {
    rtpCap: RtpCapabilities;
    transport: WebRtcTransport;
    trackId: string;
    router: Router;
  }) {
    try {
      const response = router.canConsume({
        producerId: trackId,
        rtpCapabilities: rtpCap
      });

      if (!response) {
        return { message: "Cannot consume" };
      }

      if (!transport) {
        throw new Error("ConsumeRequest: consumer transport not found");
      }

      const consumer = await transport.consume({
        producerId: trackId,
        rtpCapabilities: rtpCap,
        paused: true
      });

      if (!consumer) {
        throw new Error("Consumer not created");
      }

      this._clientConsumerTrack = consumer;

      consumer.on("transportclose", () => {
        console.log("Consumer transport closed");
        consumer.close();
      });


      console.log(await consumer.getStats())

      const consumerParams = {
        producerId: trackId,
        id: consumer.id,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters
      };

      return { consumerParams };
    } catch (error) {
      console.error("Error consuming media", error);
      throw new Error(`Failed to create client consumer for ${trackId}: ${error}`);
    }
  }

  async unpauseConsumer() {
    try {
      await this._clientConsumerTrack?.resume();
      return { success: true };
    } catch (error) {
      console.error("Failed to unpause consumer", error);
      throw error;
    }
  }

  async createAgentConsumerTrack({
    rtpCap,
    transport,
    trackId
  }: {
    rtpCap: RtpCapabilities;
    transport: DirectTransport;
    trackId: string;
  }) {
    const consumer = await transport.consume({
      producerId: trackId,
      rtpCapabilities: rtpCap,
      paused: false
    });

    this._agentConsumerTrack = consumer;
    return consumer;
  }

  async createAgentProducerTrack({
    transport,
    listenerTrack
  }: {
    transport: DirectTransport;
    listenerTrack: Consumer;
  }) {
    const producerTrack = await transport.produce({
      kind: "audio",
      rtpParameters: listenerTrack.rtpParameters
    });

    this._agentProducerTrack = producerTrack;
    return producerTrack;
  }

  closeTrack() {
    this._clientConsumerTrack?.close();
    this._clientProducerTrack?.close();
    this._agentConsumerTrack?.close();
    this._agentProducerTrack?.close();
  }

  get agentProducerTrack() {
    return this._agentProducerTrack;
  }

  get agentConsumerTrack() {
    return this._agentConsumerTrack;
  }

  get clientProducerTrack() {
    return this._clientProducerTrack;
  }

  get clientConsumerTrack() {
    return this._clientConsumerTrack;
  }
}
