import { Server, type Socket } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { RoomManager } from "../managers/ai-room-manager.js";
import type { MediaKind, RtpCapabilities, RtpParameters } from "mediasoup/node/lib/rtpParametersTypes.js";
import { server } from "../index.js";
import { DtlsParameters, IceCandidate, IceParameters } from "mediasoup/node/lib/WebRtcTransportTypes.js";
import { Producer } from "mediasoup/node/lib/types.js";

export class AiSocketServer {
  private static instance: AiSocketServer;
  private io: Server;
  private roomManager: RoomManager;

  private constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Content-Type"],
      },
    });
    this.roomManager = new RoomManager();
  }

  public static getInstance() {
    if (!AiSocketServer.instance) {
      AiSocketServer.instance = new AiSocketServer(server);
    }
    return AiSocketServer.instance;
  }

  public initialize(): Server {
    this.io.on("connection", (socket: Socket) => {
      console.log("Client connected:", socket.id);

      socket.on(
        "joinRoom",
        async (
          { roomId }: { roomId: string},
          callback: (
            response: { success: boolean; routerRtpCap?: RtpCapabilities } | { success: boolean }
          ) => void
        ) => {
          try {
            const response = await this.roomManager.joinRoom(roomId);
            callback(response);
          } catch (error) {
            console.error("Error in joining room:", error);
            callback({ success: false });
          }
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
          const clientTransportParams = await this.roomManager.createClientWebRtcTransport({ roomId });
          callback({ clientTransportParams });
        }
      );

      socket.on(
        "connect-consumer-transport",
        async (
          { roomId, dtlsParameters }: { roomId: string; dtlsParameters: DtlsParameters },
          callback: (response: { success: boolean }) => void
        ) => {
          await this.roomManager.connectClientWebRtcTransport({ roomId, dtlsParameters });
          callback({ success: true });
        }
      );

      socket.on(
        "create-plain-transport",
        async (
          { roomId }: { roomId: string },
          callback: (response: { ip: string; port: number; rtcpPort?: number }) => void
        ) => {
          const plainParams = await this.roomManager.createPlainTransport({ roomId });
          callback(plainParams);
        }
      );

	//   socket.on(
	// 	"connect-plain-transport",
	// 	async(
	// 		{
	// 			roomId,
	// 			plainParams
	// 		}: {
	// 			roomId: string,
	// 			plainParams: {
	// 				ip: string,
	// 				port: number,
	// 				rtcpPort: number | undefined
	// 			}
	// 		},
	// 		callback: (
	// 			{
	// 				success
	// 			}: {
	// 				success: boolean
	// 			}
	// 		) => void
	// 	) => {
	// 		const { success } = await this.roomManager.connectPlainTransport({roomId, plainParams})

	// 		callback(success)
	// 	}
	// )

      socket.on(
        "consume-media",
        async (
          { roomId, rtpCapabilities }: { roomId: string; rtpCapabilities: RtpCapabilities },
          callback: (response: { consumerParams?: { producerId: string; id: string; kind: MediaKind; rtpParameters: RtpParameters } } | { message: string }) => void
        ) => {
          const response = await this.roomManager.startConsume({ roomId, rtpCapabilities });
          callback(response);
        }
      );

      socket.on(
        "start-ai-produce",
        async (
          { roomId, rtpParameters }: { roomId: string; rtpParameters: RtpParameters },
          callback: (producer: Producer) => void
        ) => {
          console.log("params-ai", rtpParameters);
          const producer = await this.roomManager.startProduce(roomId, rtpParameters);
          callback(producer);
        }
      );

	  socket.on("unpauseConsumer",
		async ({
			roomId
		}: {
			roomId: string
		},
    callback: ({
      success
    }: {
      success: boolean
    }) => void
  ) => {
      console.log("Unpausing consumer");
			const success= await this.roomManager.unpauseConsumer(roomId)

      callback(success)
		}
	  )

      socket.on("disconnect", async () => {
        console.log("Client Disconnected");
      });
    });

    return this.io;
  }
}
