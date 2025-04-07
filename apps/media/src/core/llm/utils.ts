import { AsyncIterableQueue } from "../../utils/index.js";

export abstract class LLM {
    abstract chat(): LLMStream
}


export abstract class LLMStream implements AsyncIterableIterator<string> {
    protected static FLUSH_LLM = Symbol('FLUSH_LLM')
    protected input = new AsyncIterableQueue<string| typeof LLMStream.FLUSH_LLM>();
    protected output = new AsyncIterableQueue<string>();
    closed: boolean = false;
    private llm: LLM;
    constructor(llm: LLM) {
        this.llm = llm
    }

    close() {
        this.input.close()
        this.output.close();
        this.closed = true
    }

    push(content: string) {
        if (this.input.closed) {
            throw new Error('Input is closed');
        }
        if (this.closed) {
            throw new Error('Stream is closed');
        }
        this.input.put(content);
    }

    flush() {
        if (this.input.closed) {
          throw new Error('Input is closed');
        }
        if (this.closed) {
          throw new Error('Stream is closed');
        }
        this.input.put(LLMStream.FLUSH_LLM);
    }

    endInput() {
        if (this.input.closed) {
            throw new Error('Input is closed');
        }
        if (this.closed) {
            throw new Error('Stream is closed');
        }
          this.input.close();
    }
    

    next(): Promise<IteratorResult<string>> {
        return this.output.next()
    }

    [Symbol.asyncIterator]() {
        return this
    }
}