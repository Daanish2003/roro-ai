import EventEmitter from "node:events";
import { LLMStream } from "../../llm/llm.js";

export class AgentReply extends EventEmitter {
    #llmStream: LLMStream
    constructor(llmStream: LLMStream) {
        super()
        this.#llmStream = llmStream
        this.run()
    }

    private async run() {
        try {
            for await (const response of this.#llmStream) {
                this.emit("AGENT_REPLY", response)
            }
        } catch (err) {
            console.log(err)
        }
    }

}