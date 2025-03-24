import { AsyncIterableQueue } from "../../utils/index.js";

export abstract class LLM {
    abstract chat(): LLMStream
}

export type ChatChunk = {
    response: string
}

export abstract class LLMStream implements AsyncIterableIterator<ChatChunk> {
    protected output = new AsyncIterableQueue<ChatChunk>();
    private closed: boolean = false
    private llm: LLM
    constructor(llm: LLM) {
        this.llm = llm
    }

    close() {
        this.output.close();
        this.closed = true
    }

    next(): Promise<IteratorResult<ChatChunk>> {
        return this.output.next()
    }

    [Symbol.asyncIterator]() {
        return this
    }
}