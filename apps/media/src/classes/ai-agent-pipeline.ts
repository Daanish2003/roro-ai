import { DeepgramSTT } from "./deepgramSTT.js";
import { DeepgramTTS } from "./deepgramTTS.js";
import { Room } from "./room.js";
import { GeminiModel } from "./gemini-modal.js";

export class AiAgentPipeline {
    public room: Room;
    public deepgramSTT: DeepgramSTT;
	public gemini2: GeminiModel;
	public deepgramTTS: DeepgramTTS;

    constructor (prompt: string, room: Room) {
        this.room = room
        this.deepgramSTT = new DeepgramSTT(this.room)
		this.gemini2 = new GeminiModel(prompt, this.room)
		this.deepgramTTS = new DeepgramTTS(this.room)
    }

}