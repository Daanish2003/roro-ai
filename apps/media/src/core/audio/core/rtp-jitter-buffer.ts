export class RTPJitterBuffer {
    private buffer: { data: Buffer; timestamp: number }[];
    private head: number;
    private tail: number;
    private fillCount: number;
    private interval: number;
    private timer: NodeJS.Timeout | null;
  
    constructor(private bufferSize: number, private latency: number) {
      this.buffer = new Array(latency);
      this.head = 0;
      this.tail = 0;
      this.fillCount = 0;
      this.interval = 20;
      this.timer = null;
    }
  
    start(): void {
      this.timer = setInterval(() => {
        if (this.fillCount === 0) {
          return;
        }
  
        const now = Date.now();
        const expectedTime = this.tail * this.interval;
        const actualTime = now - (this.buffer[this.tail]?.timestamp ?? 0);
  
        if (actualTime >= expectedTime) {
          this.tail = (this.tail + 1) % this.latency;
          this.fillCount--;
        }
      }, Math.floor(this.interval / 2));
    }
  
    stop(): void {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }
  
    push(data: Buffer): void {
      this.buffer[this.head] = {
        data,
        timestamp: Date.now(),
      };
      this.head = (this.head + 1) % this.latency;
  
      if (this.fillCount < this.latency) {
        this.fillCount++;
      } else {
        this.tail = (this.tail + 1) % this.latency;
      }
    }
  
    shift(): Buffer | null {
      if (this.fillCount === 0) {
        return null;
      }
  
      const dataChunk = this.buffer[this.tail]!.data;
      this.tail = (this.tail + 1) % this.latency;
      this.fillCount--;
  
      return dataChunk;
    }
  
    adjustInterval(actualInterval: number): void {
      const delta = actualInterval - this.interval;
      this.interval += delta / 8;
    }
  }
  