import type {
	DtlsParameters,
	WebRtcTransport,
} from "mediasoup/node/lib/WebRtcTransportTypes";
import { DeepgramSTT } from "./deepgram-sst";
import { MediasoupServer } from "./mediasoup-server";
import type { MediaKind, RtpParameters } from "mediasoup/node/lib/rtpParametersTypes";

export class Room {
	private roomId: string;
	private mediasoupServer: MediasoupServer;
	private deepgramSTT: DeepgramSTT;
	private peers: Map<
		string,
		{
			sendTransport?: WebRtcTransport;
			recieveTransport?: WebRtcTransport;
		}
	>;

	constructor(roomId: string) {
		this.roomId = roomId;
		this.mediasoupServer = new MediasoupServer();
		this.deepgramSTT = new DeepgramSTT();
		this.peers = new Map<
			string,
			{
				sendTransport?: WebRtcTransport;
				recieveTransport?: WebRtcTransport;
			}
		>();
	}

	public async initialize() {
		try {
			await this.mediasoupServer.initialize();
			console.log(`Room ${this.roomId} initialized`);
		} catch (error) {
			console.error(`Error initializing room ${this.roomId}:`, error);
		}
	}

	public addPeer(peerId: string): void {
		if (this.peers.has(peerId)) {
			console.warn(`Peer ${peerId} is already in room ${this.roomId}`);
			return;
		}

		this.peers.set(peerId, {});
		console.log(`Peer ${peerId} added to room ${this.roomId}`);
	}

	public removePeer(peerId: string): void {
		if (!this.peers.has(peerId)) {
			console.warn(`Peer ${peerId} not found in room ${this.roomId}`);
			return;
		}
		this.peers.delete(peerId);
		console.log(`Peer ${peerId} removed from room ${this.roomId}`);
	}

	public hasPeer(peerId: string): boolean {
		return this.peers.has(peerId);
	}

	public async getRouterRtpCap() {
		const routerRtpCap = this.mediasoupServer.getRtpCapabilities();

		return routerRtpCap;
	}

	public getPeerById(peerId: string) {
		const peer = this.peers.get(peerId);
		if (!peer) {
			console.log(`Peer ${peerId} not found in room ${this.roomId}`);
		}
		return peer;
	}

	public async handleAudioStream(peerId: string, audio: Buffer): Promise<void> {
		console.log(`Processing audio for ${peerId} in room ${this.roomId}`);
		try {
			await this.deepgramSTT.sendAudio(this.roomId, audio);
		} catch (error) {
			console.error(
				`Error processing audio for ${peerId} in room ${this.roomId}:`,
				error,
			);
		}
	}

	public async handleCreateWebRtcTransport({
		peerId,
		direction,
	}: {
		peerId: string;
		direction: "send" | "recieve";
	}) {
		if (!this.peers.has(peerId)) {
			console.warn(
				`Cannot create transport. Peer ${peerId} not found in room ${this.roomId}`,
			);
			throw new Error("Peer is not found");
		}

		try {
			const clientTransportParams =
				await this.mediasoupServer.createWebRtcTransport();

			const peer = this.getPeerById(peerId);

			if (peer) {
				if (direction === "send") {
					peer.sendTransport = clientTransportParams as WebRtcTransport;
				} else if (direction === "recieve") {
					peer.recieveTransport = clientTransportParams as WebRtcTransport;
				}
			}

			return { clientTransportParams };
		} catch (error) {
			throw new Error("Handle Create WebRtcTransport:", error as Error);
		}
	}

	public async handleConnectProducerTransport({
		dtlsParameters,
		peerId,
	}: {
		dtlsParameters: DtlsParameters;
		peerId: string;
	}) {
		try {
			const peer = this.getPeerById(peerId)

		if (!peer?.sendTransport) {
			throw new Error(`Send transport for peer ${peerId} is not available`);
		}

		   await this.mediasoupServer.connectProducerTransport({dtlsParameters})

		} catch (error) {
			console.error(`Error connecting producer transport for peer ${peerId}:`, error);
            throw new Error("Failed to connect producer transport");
		}
	}

	public async handleStartProduce(
		{
			peerId,
			kind,
			rtpParameters
		}: {
			peerId: string,
			kind: MediaKind,
			rtpParameters: RtpParameters,
		}) {
			try {
				const peer = this.getPeerById(peerId)

				if (!peer?.sendTransport) {
					throw new Error(`Send transport for peer ${peerId} is not available`);
				}

				const id = await this.mediasoupServer.produce({kind, rtpParameters})

				return id

			} catch(error) {
				console.error(`Error start produce transport for peer ${peerId}:`, error);
                throw new Error("Failed to start produce transport");
			}
		}

	public close(): void {
		this.mediasoupServer.close();

		console.log(`Room ${this.roomId} closed`);
	}
}
