import Client from "./client.js";
import { DeepgramSTT } from "./deepgramSTT.js";
import { Room } from "../core/room/classes/room.js";

export class HumanInput {
    room: Room;
    stt: DeepgramSTT;
    participant: Client
    speaking: boolean = false
    constructor(room: Room, stt: DeepgramSTT, participant: Client) {
        this.room = room      
        this.stt = stt
        this.participant = participant
    }    
}