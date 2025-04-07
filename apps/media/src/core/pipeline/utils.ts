import { AsyncIterableQueue } from "../../utils/index.js";
import EventEmitter from "node:events"

export abstract class BaseAgentPipeline extends EventEmitter {
  abstract stream(): BaseAgentStream
}

export abstract class BaseAgentStream implements AsyncIterableIterator<Buffer>{
    protected input = new AsyncIterableQueue<Buffer>()
    closed = false;
    agent: BaseAgentPipeline;
    constructor(agent: BaseAgentPipeline){
      this.agent = agent
    }

    pushStream(stream: Buffer) {
        if(this.input.closed) {
            throw new Error("Input is closed")
        }

        if(this.closed) {
            throw new Error("Stream is closed")
        }

        this.input.put(stream)
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

    close() {
      this.input.close();
      this.closed = true
    }

    async next():Promise<IteratorResult<Buffer>> {
        return this.input.next()
    }

    [Symbol.asyncIterator](): BaseAgentStream {
        return this
    }
}
