import { Server, type Socket } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { RoomManager } from "../managers/room-manager.js";
import type {
	MediaKind,
	RtpCapabilities,
	RtpParameters,
} from "mediasoup/node/lib/rtpParametersTypes.js";
import type {
	DtlsParameters,
	IceCandidate,
	IceParameters,
} from "mediasoup/node/lib/types.js";
import { server } from "../index.js";


export class SocketServer {
	private static instance: SocketServer
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
		if(!SocketServer.instance) {
			SocketServer.instance = new SocketServer(server)
		}

		return SocketServer.instance
	}



	public initialize(): Server {
		this.io.on("connection", (socket: Socket) => {
			console.log("Client connected:", socket.id);

			socket.on(
				"joinRoom",
				async (
					{ 
						roomId,
						userId,
						username,
						prompt
					 }: { 
						roomId: string ,
						userId: string,
						username: string,
						prompt: string
					},
					callback: (
						response:
							| { success: boolean; routerRtpCap: RtpCapabilities }
							| { success: boolean },
					) => void,
				) => {
					
					try {
						const response = await this.roomManager.joinRoom(roomId, userId, username, prompt);

						callback(response);
					} catch (error) {
						console.error("Error in joining room:", error);
						callback({ success: false });
					}
				},
			);

			socket.on(
				"createProducerTransport",
				async (
					{
						roomId,
					}: {
						roomId: string;
					},
					callback: ({
						clientTransportParams,
					}: {
						clientTransportParams: {
							id: string;
							iceParameters: IceParameters;
							iceCandidates: IceCandidate[];
							dtlsParameters: DtlsParameters;
						};
					}) => void,
				) => {
					const clientTransportParams  =  await this.roomManager.createClientWebRtcTransport({ roomId });


					callback({ clientTransportParams });
				},
			);

			socket.on(
				"connect-producer-transport",
				async (
					{
						roomId,
						dtlsParameters,
					}: {
						roomId: string;
						dtlsParameters: DtlsParameters;
					},
					callback: ({ success }: { success: boolean }) => void,
				) => {
					await this.roomManager.connectClientWebRtcTransport({
						dtlsParameters,
						roomId,
					});

					callback({
						success: true,
					});
				},
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
				  const clientTransportParams = await this.roomManager.createClientConsumerTransport({ roomId });
				  callback({ clientTransportParams });
				}
			  );
		
			socket.on(
				"connect-consumer-transport",
				async (
				  { roomId, dtlsParameters }: { roomId: string; dtlsParameters: DtlsParameters },
				  callback: (response: { success: boolean }) => void
				) => {
				  await this.roomManager.connectClientConsumerTransport({ roomId, dtlsParameters });
				  callback({ success: true });
				}
			);

			socket.on(
				"start-produce",
				async (
					{
						roomId,
						kind,
						rtpParameters,
					}: {
						roomId: string;
						kind: MediaKind;
						rtpParameters: RtpParameters;
					},
					callback: ({
						id
					}: {
						id: string
					}) => void,
				) => {
					console.log("Start produce")
					const id = await this.roomManager.startClientWebRtcProduce({
						rtpParameters,
						roomId,
						kind,
					});

					callback({ id });
				},
			);

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
				console.log("Client Disconnected")
			});
		});

		return this.io;
	}
}

