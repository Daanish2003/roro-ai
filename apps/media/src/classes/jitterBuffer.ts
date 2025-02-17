import { Room } from "./room.js";

export class JitterBuffer {
  // The buffer stores objects with sessionId, sequence, packet, and rtpTimestamp.
  private room: Room;
  private buffer: { sessionId: string; sequence: number; packet: Buffer; rtpTimestamp: number }[] = [];
  private lastSentSequence: number = -1;
  private timer: NodeJS.Timeout;
  private scheduledTimers: NodeJS.Timeout[] = [];
  // Track the current audio session (if any)
  private currentSessionId: string | null = null;

  /**
   * @param flushInterval The interval (in ms) for regular flush attempts.
   * @param onFlush Callback function to send a packet when ready.
   */
  constructor(
    room: Room,
    private flushInterval: number,
    private onFlush: (packet: Buffer) => void
  ) {
    this.room = room;
    // Start the periodic flush timer.
    this.timer = setInterval(() => this.flush(), this.flushInterval);

    // Listen for "Speech started" to reset the jitter buffer.
    this.room.on("Speech started", () => {
      console.log("JitterBuffer: Speech started event received. Resetting jitter buffer.");
      this.reset();
      this.cancelScheduledFlushes();
    });

    this.room.on("Speech ended", () => {
      console.log("JitterBuffer: Speech ended event received. Ready to accept new packets.");
    });
  }

  /**
   * Stops the regular flush timer.
   */
  public stop(): void {
    clearInterval(this.timer);
    this.cancelScheduledFlushes();
  }

  /**
   * Reset the buffer and state.
   */
  public reset(): void {
    this.buffer = [];
    this.lastSentSequence = -1;
    this.currentSessionId = null;
    console.log("JitterBuffer: Reset sequence and cleared current session.");
  }

  /**
   * Add a packet to the jitter buffer.
   * @param sessionId An identifier for the current audio session.
   * @param sequence The RTP sequence number.
   * @param packet The serialized RTP packet.
   * @param rtpTimestamp The RTP timestamp associated with this packet.
   */
  public addPacket(sessionId: string, sequence: number, packet: Buffer, rtpTimestamp: number): void {
    // If a new session has started, clear the current buffer.
    if (this.currentSessionId && this.currentSessionId !== sessionId) {
      console.log(`JitterBuffer: New session detected (${sessionId}). Clearing current buffer.`);
      this.reset();
    }
    // Set the current session if it's not set.
    if (!this.currentSessionId) {
      this.currentSessionId = sessionId;
    }

    // Insert the packet in order.
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

  /**
   * Regular flush: send packets in order if the next expected packet is at the head.
   */
  private flush(): void {
    // Only flush if the next expected packet is at the front of the buffer.
    while (this.buffer.length > 0 && this.buffer[0]!.sequence === this.lastSentSequence + 1) {
      const item = this.buffer.shift();
      if (item) {
        try {
          this.onFlush(item.packet);
          this.lastSentSequence = item.sequence;
          console.log(`JitterBuffer: Flushed packet ${item.sequence} from session ${item.sessionId}`);
        } catch (error) {
          console.error(`JitterBuffer: Error flushing packet ${item.sequence}`, error);
        }
      }
    }
  }

  /**
   * Flush all remaining packets gradually.
   */
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

  /**
   * Cancel any scheduled flush timers.
   */
  public cancelScheduledFlushes(): void {
    this.scheduledTimers.forEach(timer => clearTimeout(timer));
    this.scheduledTimers = [];
  }
}
