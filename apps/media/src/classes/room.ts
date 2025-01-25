import { config } from "../module/config";
import { MediasoupServer } from "./mediasoup-server";


export class Room {
	private roomId: string;
	private mediasoupServer: MediasoupServer;
	private peers: Map<string>;

	constructor(roomId: string) {
		this.roomId = roomId;
		this.mediasoupServer = new MediasoupServer(config);
		this.peers = new Set<string>();
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
		if(this.peers.has(peerId)) {
            console.warn(`Peer ${peerId} is already in room ${this.roomId}`);
            return;
        }

        this.peers.add(peerId);
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

	public close(): void {
		this.mediasoupServer.close();
		console.log(`Room ${this.roomId} closed`);
	}
}
