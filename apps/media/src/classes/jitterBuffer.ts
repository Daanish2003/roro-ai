import { Room } from "../core/room/classes/room.js";

// This is ai generated

export class JitterBuffer {
  private room: Room;
  private buffer: { sessionId: string; sequence: number; packet: Buffer; rtpTimestamp: number }[] = [];
  private lastSentSequence: number = -1;
  private scheduledTimers: NodeJS.Timeout[] = [];
  private currentSessionId: string | null = null;

  constructor(
    room: Room,
    private flushInterval: number,
    private onFlush: (packet: Buffer) => void
  ) {
    this.room = room;
    
  }

  public reset(): void {
    this.buffer = [];
    this.lastSentSequence = -1;
    this.currentSessionId = null;
    console.log("JitterBuffer: Reset sequence and cleared current session.");
  }

  public addPacket(sessionId: string, sequence: number, packet: Buffer, rtpTimestamp: number): void {
    if (this.currentSessionId && this.currentSessionId !== sessionId) {
      console.log(`JitterBuffer: New session detected (${sessionId}). Clearing current buffer.`);
      this.reset();
    }
  
    if (!this.currentSessionId) {
      this.currentSessionId = sessionId;
    }

    let inserted = false;
    for (let i = 0; i < this.buffer.length; i++) {
      if (sequence < this.buffer[i]!.sequence) {
        this.buffer.splice(i, 0, { sessionId, sequence, packet, rtpTimestamp });
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      this.buffer.push({ sessionId, sequence, packet, rtpTimestamp });
    }
    console.log(`JitterBuffer: Added packet ${sequence} for session ${sessionId}`);
  }

  public flushAllGradually(): void {
    if (this.buffer.length === 0) return;
    const baseTimestamp = this.buffer[0]!.rtpTimestamp;
    for (let i = 0; i < this.buffer.length; i++) {
      const item = this.buffer[i]!;
      const delayMs = ((item.rtpTimestamp - baseTimestamp) / 48000) * 1000;
      const timer = setTimeout(() => {
        try {
          this.onFlush(item.packet);
          console.log(`JitterBuffer: Gradually flushed packet ${item.sequence} from session ${item.sessionId}`);
          this.lastSentSequence = item.sequence;
        } catch (error) {
          console.error(`JitterBuffer: Error gradually flushing packet ${item.sequence}`, error);
        }
      }, delayMs);
      this.scheduledTimers.push(timer);
    }
    this.buffer = [];
  }

  public cancelScheduledFlushes(): void {
    this.scheduledTimers.forEach(timer => clearTimeout(timer));
    this.scheduledTimers = [];
  }
}