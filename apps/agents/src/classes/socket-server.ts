import { Server, type Socket } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { v4 as uuidv4 } from 'uuid'

type Room = {
	id: string;
	peers: Set<string>;
};

type Peer = {
	roomId: string;
	socketId: string;
};

export class SocketServer {
	private io: Server;
	private peers: Map<string, Peer>;
	private rooms: Map<string, Room>;


	constructor(httpServer: HttpServer) {

		this.io = new Server(httpServer, {
			cors: {
				origin: "http://localhost:3000",
				methods: ["GET", "POST"],
			},
		});

		this.peers = new Map<string, Peer>();
		this.rooms = new Map<string, Room>();
	}

    public initialize(): Server {
        this.io.on('connection', (socket: Socket) => {
			console.log('Client connected:', socket.id);


			socket.on('createRoom', (callback: (response: { roomId: string }) => void) => {
				const roomId = uuidv4();
				this.createRoom(roomId);
				callback({ roomId })
			})


			socket.on('joinRoom', ({ roomId }: { roomId: string}, callback: (response: { success: boolean}) => void) => {
				this.joinRoom(roomId, socket.id)
				callback({ success: true });
			})


			socket.on('disconnect', () => {
				this.handleDisconnect(socket.id);
			});
		})

		return this.io
    }
    
	private createRoom(roomId: string): Room {

		if(!this.rooms.has(roomId)) {
			this.rooms.set(roomId, { id: roomId, peers: new Set<string>()})
		}

		return this.rooms.get(roomId) as Room
	}

	private joinRoom(roomId: string, peerId: string): Room | undefined {

		const room = this.rooms.get(roomId)

		if(room) {
			room.peers.add(peerId);

			this.peers.set(peerId, { roomId, socketId: peerId})
		}

		return room
	}

	private handleDisconnect(peerId: string): void {
		const peerInfo = this.peers.get(peerId)

		if(peerInfo) {
			const room = this.rooms.get(peerInfo.roomId)

			if (room) {
				room.peers.delete(peerId);
			}

			this.peers.delete(peerId)
		}
	}

	public broadcast(roomId: string, event: string, data: () => Promise<void>): void {
		const room = this.rooms.get(roomId)
        if(room) {
			// biome-ignore lint/complexity/noForEach: <explanation>
			room.peers.forEach((peerId) => this.io.to(peerId).emit(event, data))
		}
	}

	public close(): void {
		this.io.close();
		this.rooms.clear();
		this.peers.clear()
	}

}
