import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "node:http";
import { server } from "../../../index.js";
import { DtlsParameters, IceCandidate, IceParameters } from "mediasoup/node/lib/WebRtcTransportTypes.js";
import { MediaKind, RtpCapabilities, RtpParameters } from "mediasoup/node/lib/rtpParametersTypes.js";
import { roomManager } from "../../room/manager/room-manager.js";
import { validateToken } from "../../../module/jwt.js";
import { tryCatch } from "../../../utils/tryCatch.js";
import { AgentPipeline } from "../../pipeline/core/agent-pipeline.js";

export class SocketManager {
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

    this.io.use(async (socket, next) => {
      const token = socket.handshake.auth.token

      const { error } = await tryCatch(validateToken(token))

      if(error) {
        next(error)
      }

      next()
    })

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
          const response = await roomManager.joinRoom(roomId, userId, socket.id);
          console.log(response)
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
        if(!room) {
          throw new Error("CreateProducerRequest: Room not found")
        }

        const clientTransportParams = await room.mediaTransports.createClientProducerTransport(room.router)
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

        if(!room) {
          throw new Error("ConnectProducerRequest: Room not found")
        }
        await room.mediaTransports.connectClientProducerTransport({
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

        if(!room) {
          throw new Error("CreateConsumerRequest: Room not found")
        }

        const clientTransportParams = await room.mediaTransports.createClientConsumerTransport(room.router)
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
        if(!room) {
          throw new Error("ConnectConsumerRequest: Room not found")
        }
        await room.mediaTransports!.connectClientConsumerTransport({
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
        if(!room) {
          throw new Error("StartProducingRequest: Room not found")
        }

        const id = await room.mediaTracks.createClientProducerTrack({
          kind,
          rtpParameters,
          transport: room.mediaTransports.clientProducerTransport!,
        })
        const transport = await room.mediaTransports.createAgentTransport(room.router)
        const Ctrack = await room.mediaTracks.createAgentConsumerTrack({
          transport: transport,
          rtpCap: room.router.rtpCapabilities,
          trackId: id,
        })

        const Ptrack = await room.mediaTracks.createAgentProducerTrack({
          transport,
          listenerTrack: Ctrack
        })

        const ssrc = Ctrack.rtpParameters.encodings![0]!.ssrc!  

        const agent = new AgentPipeline(room.prompt, Ptrack, ssrc)
        room.addAgent(agent)
        agent?.setSocket(socket)

        const agentStream = agent.stream()

        Ctrack.on('rtp', (rtpPackets) => {
          agentStream.pushStream(rtpPackets)
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

        const response = await room.mediaTracks.createClientConsumerTrack({
          rtpCap: rtpCapabilities,
          router: room.router,
          trackId: room.mediaTracks.agentProducerTrack!.id,
          transport: room.mediaTransports.clientConsumerTransport!
        }) 

  
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
        const response = await room.mediaTracks.unpauseConsumer()!;
        callback(response);
      }
    );

    socket.on(
      "exit-room",
      async(
        {roomId} : {roomId: string},
      ) => {
        const room = roomManager.getRoom(roomId)

        if(room) {
          room.mediaTracks.closeTrack()
          room.mediaTransports.closeTransport()
          roomManager.removeRoom(room.roomId)
        }
      }
    )

    socket.on("disconnect", async () => {
        try {
            console.log("Client Disconnected");
            this.connections.delete(socket.id);

            const room = roomManager.getRoomBySocketId(socket.id)

            if(room) {
              room.mediaTracks.closeTrack()
              room.mediaTransports.closeTransport()
              roomManager.removeRoom(room.roomId)
            }

          } catch (error) {
            console.error("Error during disconnection cleanup:", error);
          }
    });
  }
}

