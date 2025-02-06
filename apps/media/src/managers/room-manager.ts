import type { DtlsParameters, MediaKind, PipeTransport, RtpCapabilities, RtpParameters } from 'mediasoup/node/lib/types.js';
import { Room } from '../classes/room.js'
import Client from '../classes/client.js';
import { mediasoupWorkerManager } from './worker-manager.js';

export class RoomManager {
    private rooms: Map<string, Room>;
    private pipeTransport: PipeTransport | null;

    constructor() {
        
        this.rooms = new Map<string, Room>();
        this.pipeTransport = null;
    }

    public async createRoom(roomId: string): Promise<string> {
        if (!this.rooms.has(roomId)) {
            console.log(roomId)
            const newRoom = new Room(roomId);

            const worker = await mediasoupWorkerManager.getWorker()

            await newRoom.initialize(worker)
            
            this.rooms.set(roomId, newRoom);
            
            console.log(`Room ${roomId} created`);
        }
        return roomId;
    }

    public async joinRoom(roomId: string, userId: string, username: string) {
        if (!this.rooms.has(roomId)) {
           await this.createRoom(roomId);
        }
        const room = this.rooms.get(roomId);
        
        if (room) {
            const client = new Client(username, userId);

            room.addClient(client);

            console.log(client)

            client.room = room

            const routerRtpCap = await room.getRouterRtpCap()

            console.log(`User ${userId} joined room ${roomId}`);
            
            return {
                success: true,
                routerRtpCap,
            };
        }

        return {
            success: false
        }
    }

    public async createClientWebRtcTransport(
        { 
            roomId, 
            type, 
        }: {
            roomId: string, 
            type: 'producer' | 'consumer', 
        }) {
        const room = this.getRoomById(roomId)

        if(!room) {
            throw new Error("Room not found webRtc transport")
        }

        if(!room.client) {
            throw new Error("Client is not present in the room")
        }

        const clientTransportParams = await room.client.createClientTransport(type)

        return clientTransportParams

    }

    public async connectClientWebRtcTransport(
        {
            dtlsParameters,
            roomId,
            type
        }: {
            dtlsParameters: DtlsParameters,
            roomId: string,
            type: 'producer' | 'consumer'
        }
    ) {
        const room = this.getRoomById(roomId)

        if(!room) {
            throw new Error("Room not found connect transport")
        }

        if(!room.client) {
            throw new Error("Client is not present in the room")
        }

        await room.client.connectClientTransport({dtlsParameters, type})
    }

    public async startClientWebRtcProduce(
        {
            rtpParameters,
            kind,
            roomId,
        }: {
            rtpParameters: RtpParameters,
            kind: MediaKind,
            roomId: string

        }
    ) {
        const room = this.getRoomById(roomId)

        if(!room) {
            throw new Error("Room not found produce")
        }

        if(!room.client) {
            throw new Error("Client is not present in the room")
        }

        const id = await room.client.produce({rtpParameters, kind })

        console.log(id)

        return id
    }

    public async startConsume(
        {
            rtpCapabilities,
            roomId,
        }: {
            rtpCapabilities : RtpCapabilities,
            roomId: string,
        }
    ) {
        const room = this.getRoomById(roomId)

        if(!room) {
            throw new Error("Room not found consume")
        }

        if(!room.client) {
            throw new Error("Client is not present in the room")
        }

        const consumerParams = await room.client.consume({rtpCapabilities })

        return consumerParams
    }

    public getRoomById(roomId: string): Room | undefined {
        return this.rooms.get(roomId)
    }

    public getAllRoomIds(): string[] {
        return Array.from(this.rooms.keys());
    }
}
