import { Server, type Socket } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { RoomManager } from "../managers/ai-room-manager.js";
import type {
	MediaKind,
	RtpCapabilities,
	RtpParameters,
} from "mediasoup/node/lib/rtpParametersTypes.js";
import { server } from "../index.js";
import { Producer } from "mediasoup/node/lib/types.js";

export class AiSocketServer {
	private static instance: AiSocketServer
	private io: Server;
	private roomManager: RoomManager;

	private constructor(httpServer: HttpServer) {
		this.io = new Server(httpServer, {
			cors: {
				origin: "http://localhost:3000",
				methods: ["GET", "POST"],
				credentials: true,
				allowedHeaders: ["content-Type"],
			},
		});

		this.roomManager = new RoomManager();
	}

	public static getInstance() {
		if(!AiSocketServer.instance) {
			AiSocketServer.instance = new AiSocketServer(server)
		}

		return AiSocketServer.instance
	}



	public initialize(): Server {
		this.io.on("connection", (socket: Socket) => {
			console.log("Client connected:", socket.id);

			socket.on(
				"joinRoom",
				async (
					{ 
						roomId,
					 }: { 
						roomId: string ,
						userId: string,
						username: string
					},
					callback: (
						response:
							| { success: boolean; routerRtpCap: RtpCapabilities }
							| { success: boolean },
					) => void,
				) => {
					
					try {
						const response = await this.roomManager.joinRoom(roomId);

						callback(response);
					} catch (error) {
						console.error("Error in joining room:", error);
						callback({ success: false });
					}
				},
			);


			socket.on(
				"create-plain-transport",
				async(
					{
					   roomId
					}: {
				      roomId: string
					}, 
					callback: ({
						ip,
						port,
						rtcpPort,
					}: {
						ip: string,
						port: number,
						rtcpPort: number | undefined
					}) => void
				) => {
					const plainParams = await this.roomManager.createPlainTransport({roomId})


                    callback(plainParams)
				}
			)

            socket.on(
				"connect-plain-transport",
				async(
					{
                        ip,
                        port,
                        rtcpPort,
                        roomId,
					}: {
                        ip: string,
						port: number,
                        rtcpPort: number | undefined
                        roomId: string
					}, 
					callback: ({
                        success,
                    }: {
                        success: boolean
                    }) => void
				) => {
					const response = await this.roomManager.connectPlainTransport({ip, port, rtcpPort, roomId})


                    callback(response)
				}
			)

			socket.on(
				"consume-media",
				async (
					{
						roomId,
						rtpCapabilities,
						producerId
					}: {
						roomId: string;
						rtpCapabilities: RtpCapabilities;
						producerId: string
					},
					callback: ({
						consumerParams,
					}: {
						consumerParams:
							| {
									producerId: string;
									id: string;
									kind: MediaKind;
									rtpParameters: RtpParameters;
							  }
							| {
									message: string;
							  };
					}) => void,
				) => {
					const consumerParams = await this.roomManager.startConsume({
						rtpCapabilities,
						roomId,
						producerId
					});

					callback({ consumerParams });
				},
			);

			socket.on(
				"produce-ai-audio",
				async (
					{
						roomId,
					}: {
						roomId: string;
					},
					callback: (producer: Producer) => void,
				) => {
					const producer = await this.roomManager.startProduce(roomId);

					callback(producer);
				},
			);

			socket.on("disconnect", async () => {
				console.log("Client Disconnected")
			});
		});

		return this.io;
	}
}

