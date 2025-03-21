import { VAD } from "../../vad/core/vad.js";
import { DeepgramSTT } from "./deepgramSTT.js";

class HumanInput {
    private stt: DeepgramSTT = new DeepgramSTT()
    private vad: VAD

    constructor(vad: VAD) {
        this.vad = vad
    }
}