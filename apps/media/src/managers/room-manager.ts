import type { DtlsParameters, MediaKind, RtpCapabilities, RtpParameters } from 'mediasoup/node/lib/types.js';
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

    public async createClientConsumerTransport({ roomId }: { roomId: string }) {
        const room = this.getRoomById(roomId);
        if (!room) {
          throw new Error("Room not found for WebRTC transport");
        }
        if (!room.client) {
          throw new Error("Ai is not present in the room");
        }
        const clientTransportParams = await room.client.createConsumerTransport();
        return clientTransportParams;
      }
    
      public async connectClientConsumerTransport({
        dtlsParameters,
        roomId,
      }: {
        dtlsParameters: DtlsParameters;
        roomId: string;
      }): Promise<void> {
        const room = this.getRoomById(roomId);
        if (!room) {
          throw new Error("Room not found for connecting transport");
        }
        if (!room.client) {
          throw new Error("Client is not present in the room");
        }
        await room.client.connectConsumerTransport({ dtlsParameters });
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

    public async startConsume({
        rtpCapabilities,
        roomId,
      }: {
        rtpCapabilities: RtpCapabilities;
        roomId: string;
      }): Promise<
        | {
            consumerParams: {
              producerId: string;
              id: string;
              kind: MediaKind;
              rtpParameters: RtpParameters;
            };
          }
        | { message: string }
      > {
        const room = this.getRoomById(roomId);
        if (!room) {
          throw new Error("Room not found for consuming media");
        }
        if (!room.client) {
          throw new Error("Client is not present in the room");
        }
        const response = await room.client.consumeMedia({ rtpCapabilities });
        return response;
      }

      public async unpauseConsumer(roomId: string) {
        const room = this.getRoomById(roomId);
        if (!room) {
          throw new Error("Room not found for producing media");
        }
        if (!room.client) {
          throw new Error("Client is not present in the room");
        }
    
        const { success } = await room.client.unpauseConsumer();
    
        return { success }
      }

    public getRoomById(roomId: string): Room | undefined {
        return this.rooms.get(roomId)
    }

    public getAllRoomIds(): string[] {
        return Array.from(this.rooms.keys());
    }
}
