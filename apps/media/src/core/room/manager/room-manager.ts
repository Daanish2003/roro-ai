import { config } from '../../config/media-config.js';
import { routerManager } from '../../mediasoup/managers/media-router-manager.js';
import { mediasoupWorkerManager } from '../../mediasoup/managers/media-worker-manager.js';
import { AgentPipeline } from '../../pipeline/core/agent-pipeline.js';
import { agentManager } from '../../pipeline/managers/agent-pipeline-manager.js';
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
                  router.on("@close", () => {
                    console.log(`Router [${router.id}] for worker [${worker.pid}] has been closed`)
                })
                  routerManager.addRouter(router)
                   
                  const agent = new AgentPipeline()
                  agentManager.addPipeline(agent)
                  const room= new Room(roomId, topic, userId, router, prompt, agent.agentId);
                  this.rooms.set(room.roomId, room)
              } catch (error) {
                  throw new Error(`Room Manager Failed to create room: ${error}`)
              }
          }
    }

    async joinRoom(roomId: string, userId: string) {
      if (!this.hasRoom(roomId)) {
         return {
            success: false,
            message: "Room not found",
         }
      }
      
      const room = this.getRoom(roomId);
  
      const response  = await room!.addParticipant(userId)
  
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
}

export const roomManager = RoomManager.getInstance()
