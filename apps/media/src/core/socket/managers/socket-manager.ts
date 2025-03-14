import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "node:http";
import { server } from "../../../index.js";
import { joinRoom } from "../../room/functions/room-service.js";
import { DtlsParameters, IceCandidate, IceParameters } from "mediasoup/node/lib/WebRtcTransportTypes.js";
import { MediaKind, RtpCapabilities, RtpParameters } from "mediasoup/node/lib/rtpParametersTypes.js";
import { connectWebRtcTransport, createDirectTransport, createWebRTCTransport } from "../../mediasoup/functions/media-transport.js";
import { roomManager } from "../../room/manager/room-manager.js";
import { agentTrack, ConsumerTrack, listenerTrack, produceTrack } from "../../mediasoup/functions/media-track.js";
import { unpauseConsumer } from "../../mediasoup/functions/media-controller.js";

class SocketManager {
  private static instance: SocketManager;
  private io: Server;
  private connections: Map<string, Socket>;

  constructor(httpServer: HttpServer) {
    this.connections = new Map();
    this.io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["content-Type"],
      },
    });

    this.io.on("connection", (socket) => {
      console.log(`Client connected: ${socket.id}`);
      this.connections.set(socket.id, socket);

      this.socketListeners(socket)
    });
  }

  static getInstance() {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager(server);
    }

    return SocketManager.instance;
  }

  addSocket(socket: Socket) {
    this.connections.set(socket.id, socket);
  }

  getSocket(socketId: string) {
    return this.connections.get(socketId);
  }

  hasSocket(socketId: string) {
    return this.connections.has(socketId);
  }

  socketListeners(socket: Socket) {
    socket.on(
      "joinRoom",
      async (
        { roomId, userId }: { roomId: string; userId: string },
        callback: (response: { success: boolean; message: string; routerRtpCap?: RtpCapabilities }) => void
      ) => {
        try {
          const response = await joinRoom(roomId, userId);
          callback(response);
        } catch (error) {
          console.error("Error in joining room:", error);
          callback({
            success: false,
            message: "Connection error failed to join room",
          });
        }
      }
    );

    socket.on(
      "createProducerTransport",
      async (
        { roomId }: { roomId: string },
        callback: (response: {
          clientTransportParams: {
            id: string;
            iceParameters: IceParameters;
            iceCandidates: IceCandidate[];
            dtlsParameters: DtlsParameters;
          };
        }) => void
      ) => {
        const room = roomManager.getRoom(roomId)
        const clientTransportParams = await createWebRTCTransport(room!.routerId)
        callback({ clientTransportParams });
      }
    );

    socket.on(
      "connect-producer-transport",
      async (
        { roomId, dtlsParameters }: { roomId: string; dtlsParameters: DtlsParameters },
        callback: (response: { success: boolean }) => void
      ) => {
        const room = roomManager.getRoom(roomId)
        const transportId = room!.getProducerTransportId()!

        await connectWebRtcTransport({
          transportId,
          dtlsParameters
        })

        callback({ success: true });
      }
    );

    socket.on(
      "createConsumerTransport",
      async (
        { roomId }: { roomId: string },
        callback: (response: {
          clientTransportParams: {
            id: string;
            iceParameters: IceParameters;
            iceCandidates: IceCandidate[];
            dtlsParameters: DtlsParameters;
          };
        }) => void
      ) => {
        const room = roomManager.getRoom(roomId)
        const clientTransportParams = await createWebRTCTransport(room!.routerId)
        callback({ clientTransportParams });
      }
    );

    socket.on(
      "connect-consumer-transport",
      async (
        { roomId, dtlsParameters }: { roomId: string; dtlsParameters: DtlsParameters },
        callback: (response: { success: boolean }) => void
      ) => {
        const room = roomManager.getRoom(roomId)
        const transportId = room!.getConsumerTransportId()!
        await connectWebRtcTransport({
          transportId,
          dtlsParameters
        })
        callback({ success: true });
      }
    );

    socket.on(
      "start-produce",
      async (
        { roomId, kind, rtpParameters }: { roomId: string; kind: MediaKind; rtpParameters: RtpParameters },
        callback: ({ id }: { id: string }) => void
      ) => {
        const room = roomManager.getRoom(roomId)
        const transportId = room!.getProducerTransportId()!
        const id = await produceTrack({
          kind,
          rtpParameters,
          transportId
        })

        const transport = await createDirectTransport(room!.roomId)
        const track = await listenerTrack({
          transport,
          routerId: room!.roomId,
          trackId: id
        })

        await agentTrack({
          transport,
          listenerTrack: track,
        })

        callback({ id });
      }
    );

    socket.on(
      "consume-media",
      async (
        { roomId, rtpCapabilities }: { roomId: string; rtpCapabilities: RtpCapabilities },
        callback: (
          response:
            | {
                consumerParams?: {
                  producerId: string;
                  id: string;
                  kind: MediaKind;
                  rtpParameters: RtpParameters;
                };
              }
            | { message: string }
        ) => void
      ) => {
        const room = roomManager.getRoom(roomId)

        if(!room) {
          throw new Error("ConsumeMediaRequest: Room not found")
        }
        const trackId = room.getAgentTrackId()!
        const transportId = room.getConsumerTransportId()!

        const response = await ConsumerTrack(room.routerId, trackId, rtpCapabilities, transportId) 

  
        callback(response);
      }
    );

    socket.on(
      "unpauseConsumer",
      async (
        { roomId }: { roomId: string },
        callback: ({ success }: { success: boolean }) => void
      ) => {
        const room = roomManager.getRoom(roomId)

        if(!room) {
          throw new Error("ConsumeMediaRequest: Room not found")
        }

        const trackId = room.getConsumerTrackId()!
        const response = await unpauseConsumer(trackId);
        callback(response);
      }
    );

    socket.on("disconnect", async () => {
        try {
            console.log("Client Disconnected");
            this.connections.delete(socket.id);
          } catch (error) {
            console.error("Error during disconnection cleanup:", error);
          }
    });
  }
}

export const socketManager = SocketManager.getInstance();
