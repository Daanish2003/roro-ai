import type { DtlsParameters, MediaKind, RtpParameters } from 'mediasoup/node/lib/types.js';
import { Room } from '../classes/room.js'
import Client from '../classes/client.js';
import { mediasoupWorkerManager } from './worker-manager.js';

export class RoomManager {
    private rooms: Map<string, Room>;

    constructor() {     
        this.rooms = new Map<string, Room>();
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
        }: {
            roomId: string,
        }) {
        const room = this.getRoomById(roomId)

        if(!room) {
            throw new Error("Room not found webRtc transport")
        }

        if(!room.client) {
            throw new Error("Client is not present in the room")
        }

        const clientTransportParams  = await room.client.createWebRtcTransport()

        return clientTransportParams

    }

    public async createPlainTransport(
        {
            roomId
        }: {
            roomId: string
        }
    ) {
        const room = this.getRoomById(roomId)

        if(!room) {
            throw new Error("Room not found consume")
        }

        if(!room.client) {
            throw new Error("Client is not present in the room")
        }

        const plainParams = await room.client.createPlainTransport()

        return plainParams
    }

    public async connectClientWebRtcTransport(
        {
            dtlsParameters,
            roomId,
        }: {
            dtlsParameters: DtlsParameters,
            roomId: string
        }
    ) {
        console.log("Room-manager-connect")
        const room = this.getRoomById(roomId)

        if(!room) {
            throw new Error("Room not found connect transport")
        }

        if(!room.client) {
            throw new Error("Client is not present in the room")
        }

        await room.client.connectWebRtcTransport({dtlsParameters})
    }

    public async forwardMedia(
        {
            roomId
        }: {
            roomId: string
        }
    ) {
        const room = this.getRoomById(roomId)

        if(!room) {
            throw new Error("Room not found forward media")
        }

        if(!room.client) {
            throw new Error("Client is not present in the room")
        }

        const rtpParameters = await room.client.forwardProducerToPlainTransport()

        return rtpParameters
    }

    public async connectPlainTransport(
        {
            roomId,
            ip,
            port,
            rtcpPort
        } : {
            roomId: string,
            ip: string,
            port: number,
            rtcpPort: number | undefined
        }) {
        const room = this.getRoomById(roomId);
        if (!room) {
          throw new Error("Room not found for plain transport");
        }
        if (!room.client) {
          throw new Error("Client is not present in the room");
        }
    
        const success = await room.client.connectPlainTransport({ip, port, rtcpPort}); 
    
        return { success };
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
        console.log("Room-manager-produce")
        const room = this.getRoomById(roomId)

        if(!room) {
            throw new Error("Room not found produce")
        }

        if(!room.client) {
            throw new Error("Client is not present in the room")
        }

        const params = await room.client.produceMedia({rtpParameters, kind })

        return params
    }

    public getRoomById(roomId: string): Room | undefined {
        return this.rooms.get(roomId)
    }

    public getAllRoomIds(): string[] {
        return Array.from(this.rooms.keys());
    }
}
