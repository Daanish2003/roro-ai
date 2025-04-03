import { AsyncIterableQueue } from "../../utils/index.js";

export abstract class LLM {
    abstract chat(): LLMStream
}


export abstract class LLMStream implements AsyncIterableIterator<string> {
    protected output = new AsyncIterableQueue<string>();
    closed: boolean = false
    private llm: LLM
    constructor(llm: LLM) {
        this.llm = llm
    }

    close() {
        this.output.close();
        this.closed = true
    }

    next(): Promise<IteratorResult<string>> {
        return this.output.next()
    }

    [Symbol.asyncIterator]() {
        return this
    }
}