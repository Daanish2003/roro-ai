import { config } from '../../config/media-config.js';
import { routerManager } from '../../mediasoup/managers/media-router-manager.js';
import { mediasoupWorkerManager } from '../../mediasoup/managers/media-worker-manager.js';
import { Room } from '../classes/room.js'

class RoomManager {
    private static instance: RoomManager
    private rooms: Map<string, Room>;

    constructor() {     
        this.rooms = new Map();
    }

    public static getInstance() {
      if(!RoomManager.instance) {
         RoomManager.instance = new RoomManager()
      }

      return RoomManager.instance
    }

    async createRoom(roomId: string, topic: string, prompt: string, userId: string) {
      if(!roomManager.hasRoom(roomId)) {
              try {
                  const worker = await mediasoupWorkerManager.getAvailableWorker()
                  const router = await worker.createRouter(config.mediasoup.router)
                  routerManager.addRouter(router)
                  const room= new Room(roomId, topic, userId, router, prompt);
                  this.rooms.set(room.roomId, room)
              } catch (error) {
                  throw new Error(`Room Manager Failed to create room: ${error}`)
              }
          }
    }

    async joinRoom(roomId: string, userId: string, socketId: string) {
      if (!this.hasRoom(roomId)) {
         return {
            success: false,
            message: "Room not found",
         }
      }
      
      const room = this.getRoom(roomId);
  
      const response  = await room!.addParticipant(userId, socketId)
  
      return response
  }

    hasRoom(roomId: string) {
      return this.rooms.has(roomId)
    }

    addRoom(room: Room) {
      this.rooms.set(room.roomId, room)
    }

    getRoom(roomId: string): Room | undefined {
        return this.rooms.get(roomId)
    }

    removeRoom(roomId: string) {
      this.rooms.delete(roomId)
    }

    getRoomBySocketId(socketId: string) {
      for (const room of this.rooms.values()) {
        if(room.socketId === socketId) {
          return room
        }
      }

      return undefined
    }
}

export const roomManager = RoomManager.getInstance()
