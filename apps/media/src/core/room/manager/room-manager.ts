import { Room } from '../classes/room.js'

class RoomManager {
    private static instance: RoomManager
    private rooms: Map<string, Room>;

    constructor() {     
        this.rooms = new Map<string, Room>();
    }

    public static getInstance() {
      if(!RoomManager.instance) {
         RoomManager.instance = new RoomManager()
      }

      return RoomManager.instance
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
