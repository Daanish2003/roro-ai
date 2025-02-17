import { DeepgramSTT } from "./deepgramSTT.js";
import { DeepgramTTS } from "./deepgramTTS.js";
import { GeminiModal } from "./gemini-modal.js";
import { Room } from "./room.js";

export class AiAgentPipeline {
    public room: Room | null
    public deepgramSTT: DeepgramSTT;
	public gemini2: GeminiModal;
	public deepgramTTS: DeepgramTTS;

    constructor (prompt: string, room: Room) {
        this.room = room
        this.deepgramSTT = new DeepgramSTT(this.room)
		this.gemini2 = new GeminiModal(prompt, this.room)
		this.deepgramTTS = new DeepgramTTS(this.room)
    }

}