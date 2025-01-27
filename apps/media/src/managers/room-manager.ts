import type { DtlsParameters, MediaKind, RtpParameters } from 'mediasoup/node/lib/types';
import { Room } from '../classes/room'

export class RoomManager {
    private rooms: Map<string, Room>;

    constructor() {
        this.rooms = new Map<string, Room>();
    }

    public async createRoom(roomId: string): Promise<string> {
        if (!this.rooms.has(roomId)) {
            
            console.log(roomId)
            const newRoom = new Room(roomId);

            await newRoom.initialize(); 
            this.rooms.set(roomId, newRoom);
            console.log(`Room ${roomId} created`);
        }
        return roomId;
    }

    public async joinRoom(roomId: string, peerId: string) {
        if (!this.rooms.has(roomId)) {
           await this.createRoom(roomId);
        }
        const room = this.rooms.get(roomId);
        
        if (room) {
            room.addPeer(peerId);
            const routerRtpCap = await room.getRouterRtpCap()
            console.log(`Peer ${peerId} joined room ${roomId}`);
            
            console.log(routerRtpCap)
            return {
                success: true,
                routerRtpCap,
            };
        }
        return {
            success: false
        }
    }

    public async createWebRtcTransportForRoom(
        { 
            roomId, 
            direction, 
            peerId
        }: {
            roomId: string, 
            direction: 'send' | 'recieve', 
            peerId: string
        }) {
        const room = this.getRoomById(roomId)

        if(!room) {
            throw new Error("Room not found")
        }

        const { clientTransportParams } = await room.handleCreateWebRtcTransport({peerId, direction})

        return { clientTransportParams }

    }

    public async connectProducerTransport(
        {
            dtlsParameters,
            roomId,
            peerId
        }: {
            dtlsParameters: DtlsParameters,
            roomId: string,
            peerId: string
        }
    ) {
        const room = this.getRoomById(roomId)

        if(!room) {
            throw new Error("Room not found")
        }

        await room.handleConnectProducerTransport({dtlsParameters, peerId})

    }

    public async startProduce(
        {
            rtpParameters,
            kind,
            peerId,
            roomId,
        }: {
            rtpParameters: RtpParameters,
            kind: MediaKind,
            peerId: string,
            roomId: string

        }
    ) {
        const room = this.getRoomById(roomId)

        if(!room) {
            throw new Error("Room not found")
        }

        const id = await room.handleStartProduce({rtpParameters, kind, peerId})

        return id
    }

    public removePeerFromRoom(roomId: string, peerId: string): boolean {
        const room = this.rooms.get(roomId);
        if (room) {
            room.removePeer(peerId);
            return true;
        }
            console.warn(`Room ${roomId} not found`);
            return false;
    }

    public closeRoom(roomId: string): void {
        const room = this.rooms.get(roomId);
        if (room) {
            room.close();
            this.rooms.delete(roomId);
            console.log(`Room ${roomId} closed and removed`);
        } else {
            console.warn(`Room ${roomId} not found`);
        }
    }

    public getRoomById(roomId: string): Room | undefined {
        return this.rooms.get(roomId)
    }

    public getAllRoomIds(): string[] {
        return Array.from(this.rooms.keys());
    }
}
