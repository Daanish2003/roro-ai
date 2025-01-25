import { Room } from '../classes/room';
import { v4 as uuidv4} from "uuid"

export class RoomManager {
    private rooms: Map<string, Room>;

    constructor() {
        this.rooms = new Map<string, Room>();
    }

    public createRoom(): string {
        const roomId = uuidv4();  
        const newRoom = new Room(roomId);
        newRoom.initialize(); 
        this.rooms.set(roomId, newRoom);
        console.log(`Room ${roomId} created`);
        return roomId;
    }

    public joinRoom(roomId: string, peerId: string): boolean {
        const room = this.rooms.get(roomId);
        if (room) {
            room.addPeer(peerId);
            return true;
        } 
            console.warn(`Room ${roomId} not found`);
            return false;
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
