import type { DtlsParameters, MediaKind, RtpCapabilities, RtpParameters } from "mediasoup/node/lib/types.js";
import { mediasoupWorkerManager } from "./worker-manager.js";
import { Room } from "../classes/room.js";
import Ai from "../classes/ai.js";

export class RoomManager {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map<string, Room>();
  }

  public async createRoom(roomId: string): Promise<string> {
    if (!this.rooms.has(roomId)) {
      console.log("Creating room:", roomId);
      const newRoom = new Room(roomId);
      const worker = await mediasoupWorkerManager.getWorker();
      await newRoom.initialize(worker);
      this.rooms.set(roomId, newRoom);
      console.log(`Room ${roomId} created`);
    }
    return roomId;
  }

  public async joinRoom(roomId: string) {
    if (!this.rooms.has(roomId)) {
      await this.createRoom(roomId);
    }
    const room = this.rooms.get(roomId);
    if (room) {
      const ai = new Ai();
      room.addAi(ai);
      ai.room = room;
      const routerRtpCap = await room.getRouterRtpCap();
      console.log(`Ai joined room ${roomId}`);
      return {
        success: true,
        routerRtpCap,
      };
    }
    return { success: false };
  }

  public async createClientWebRtcTransport({ roomId }: { roomId: string }) {
    const room = this.getRoomById(roomId);
    if (!room) {
      throw new Error("Room not found for WebRTC transport");
    }
    if (!room.ai) {
      throw new Error("Ai is not present in the room");
    }
    const clientTransportParams = await room.ai.createWebRtcTransport();
    return clientTransportParams;
  }

  public async connectClientWebRtcTransport({
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
    if (!room.ai) {
      throw new Error("Client is not present in the room");
    }
    await room.ai.connectWebRtcTransport({ dtlsParameters });
  }

  public async createPlainTransport({ roomId }: { roomId: string }): Promise<{ ip: string; port: number; rtcpPort?: number }> {
    const room = this.getRoomById(roomId);
    if (!room) {
      throw new Error("Room not found for plain transport");
    }
    if (!room.ai) {
      throw new Error("Client is not present in the room");
    }
    const plainParams = await room.ai.createAiPlainTransport();
    return plainParams;
  }

//   public async connectPlainTransport(
//     {
//         roomId,
//         plainParams,
//     } : {
//         roomId: string,
//         plainParams: {
//             ip: string,
//             port: number,
//             rtcpPort: number | undefined
//         }
//     }) {
//     const room = this.getRoomById(roomId);
//     if (!room) {
//       throw new Error("Room not found for plain transport");
//     }
//     if (!room.ai) {
//       throw new Error("Client is not present in the room");
//     }

//     const success = await room.ai.connectPlainTransport(plainParams); 

//     return { success };
//   }

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
    if (!room.ai) {
      throw new Error("Client is not present in the room");
    }
    const response = await room.ai.consumeMedia({ rtpCapabilities });
    return response;
  }

  public async startProduce(roomId: string, rtpParameters: RtpParameters) {
    const room = this.getRoomById(roomId);
    if (!room) {
      throw new Error("Room not found for producing media");
    }
    if (!room.ai) {
      throw new Error("Client is not present in the room");
    }
    const producer = await room.ai.receiveExternalRtpMedia(rtpParameters);
    return producer;
  }

  public async unpauseConsumer(roomId: string) {
    const room = this.getRoomById(roomId);
    if (!room) {
      throw new Error("Room not found for producing media");
    }
    if (!room.ai) {
      throw new Error("Client is not present in the room");
    }

    const { success } = await room.ai.unpauseConsumer();

    return { success }
  }

  public getRoomById(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  public getAllRoomIds(): string[] {
    return Array.from(this.rooms.keys());
  }
}
