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

export class SocketServer {
	private io: Server;
	private roomManager: RoomManager;

	constructor(httpServer: HttpServer) {
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

	public initialize(): Server {
		this.io.on("connection", (socket: Socket) => {
			console.log("Client connected:", socket.id);

			socket.on(
				"joinRoom",
				async (
					{ roomId }: { roomId: string },
					callback: (
						response:
							| { success: boolean; routerRtpCap: RtpCapabilities }
							| { success: boolean },
					) => void,
				) => {
					
					try {
						const response = await this.roomManager.joinRoom(roomId, socket.id);
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
						direction,
					}: {
						roomId: string;
						direction: "send";
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
					const { clientTransportParams } =
						await this.roomManager.createWebRtcTransportForRoom({
							roomId,
							direction,
							peerId: socket.id,
						});

					console.log(clientTransportParams);

					callback({ clientTransportParams });
				},
			);

			socket.on(
				"connect-producer-transport",
				async (
					{
						roomId,
						dtlsParameters,
						type,
					}: {
						roomId: string;
						dtlsParameters: DtlsParameters;
						type: "producer";
					},
					callback: ({ success }: { success: boolean }) => void,
				) => {
					await this.roomManager.connectTransport({
						dtlsParameters,
						roomId,
						peerId: socket.id,
						type,
					});

					callback({
						success: true,
					});
				},
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
						id,
					}: {
						id: string;
					}) => void,
				) => {
					const id = await this.roomManager.startProduce({
						rtpParameters,
						roomId,
						peerId: socket.id,
						kind,
					});

					callback({ id });
				},
			);

			socket.on(
				"createConsumerTransport",
				async (
					{
						roomId,
						direction,
					}: {
						roomId: string;
						direction: "recieve";
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
					const { clientTransportParams } =
						await this.roomManager.createWebRtcTransportForRoom({
							roomId,
							direction,
							peerId: socket.id,
						});

					console.log(clientTransportParams);

					callback({ clientTransportParams });
				},
			);

			socket.on(
				"connect-consumer-transport",
				async (
					{
						roomId,
						dtlsParameters,
						type,
					}: {
						roomId: string;
						dtlsParameters: DtlsParameters;
						type: "consumer";
					},
					callback: ({ success }: { success: boolean }) => void,
				) => {
					await this.roomManager.connectTransport({
						dtlsParameters,
						roomId,
						peerId: socket.id,
						type,
					});

					callback({
						success: true,
					});
				},
			);

			socket.on(
				"consume-media",
				async (
					{
						roomId,
						rtpCapabilities,
					}: {
						roomId: string;
						rtpCapabilities: RtpCapabilities;
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
						peerId: socket.id,
					});

					callback({ consumerParams });
				},
			);

			socket.on(
				"audioStream",
				({
					roomId,
					audio,
				}: {
					roomId: string;
					audio: Buffer;
				}) => {
					console.log(`Received audio from ${socket.id} in room ${roomId}`);

					const room = this.roomManager.getRoomById(roomId);

					if (room) {
						room.handleAudioStream(socket.id, audio);
					}
				},
			);

			socket.on("disconnect", async () => {
				await this.handleDisconnect(socket.id);
			});
		});

		return this.io;
	}

	private async handleDisconnect(peerId: string): Promise<void> {
		console.log(`Peer ${peerId} disconnected`);

		const allRoomIds = this.roomManager.getAllRoomIds();
		for (const roomId of allRoomIds) {
			const room = this.roomManager.getRoomById(roomId);
			if (room) {
				room.removePeer(peerId);
			}
		}

		console.log(`Cleaned up peer ${peerId} from all rooms`);
	}

	// Close all rooms and the Socket.IO server
	public close(): void {
		this.io.close();
		const allRoomIds = this.roomManager.getAllRoomIds();
		for (const roomId of allRoomIds) {
			this.roomManager.closeRoom(roomId);
		}
	}
}
