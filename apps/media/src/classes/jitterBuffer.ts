export class JitterBuffer {
    // The buffer stores objects with sequence, packet, and rtpTimestamp.
    private buffer: { sequence: number; packet: Buffer; rtpTimestamp: number }[] = [];
    private lastSentSequence: number = -1;
    private timer: NodeJS.Timeout;
  
    /**
     * @param flushInterval The interval (in ms) for regular flush attempts.
     * @param onFlush Callback function to send a packet when ready.
     */
    constructor(
      private flushInterval: number,
      private onFlush: (packet: Buffer) => void
    ) {
      // Regular flush attempts.
      this.timer = setInterval(() => this.flush(), this.flushInterval);
    }
  
    public stop(): void {
      clearInterval(this.timer);
    }
  
    /**
     * Add a packet to the jitter buffer.
     * @param sequence The RTP sequence number.
     * @param packet The serialized RTP packet.
     * @param rtpTimestamp The RTP timestamp associated with this packet.
     */
    public addPacket(sequence: number, packet: Buffer, rtpTimestamp: number): void {
      this.buffer.push({ sequence, packet, rtpTimestamp });
      // Sort the buffer by sequence number.
      this.buffer.sort((a, b) => a.sequence - b.sequence);
      console.log(`JitterBuffer: Added packet ${sequence}`);
    }
  
    /**
     * Regular flush: send packets in order if the next expected packet is at the head.
     */
    private flush(): void {
      // Check that the first element exists using non-null assertion.
      while (
        this.buffer.length > 0 &&
        this.buffer[0]!.sequence === this.lastSentSequence + 1
      ) {
        const item = this.buffer.shift();
        if (item) {
          const { sequence, packet } = item;
          this.onFlush(packet);
          this.lastSentSequence = sequence;
          console.log(`JitterBuffer: Flushed packet ${sequence}`);
        }
      }
    }
  
    /**
     * Flush all remaining packets gradually. Each packet is scheduled for delivery
     * using a delay based on its RTP timestamp relative to the first packet.
     */
    public flushAllGradually(): void {
      if (this.buffer.length === 0) return;
      // Ensure the buffer is sorted.
      this.buffer.sort((a, b) => a.sequence - b.sequence);
      // Use the first packet's RTP timestamp as the base.
      const baseTimestamp = this.buffer[0]!.rtpTimestamp;
      for (let i = 0; i < this.buffer.length; i++) {
        const item = this.buffer[i]!;
        const { sequence, packet, rtpTimestamp } = item;
        // Calculate delay in milliseconds assuming a 48kHz clock.
        const delayMs = ((rtpTimestamp - baseTimestamp) / 48000) * 1000;
        setTimeout(() => {
          this.onFlush(packet);
          console.log(`JitterBuffer: Gradually flushed packet ${sequence}`);
        }, delayMs);
        // Optionally, update lastSentSequence.
        this.lastSentSequence = sequence;
      }
      // Clear the buffer after scheduling all packets.
      this.buffer = [];
    }
  }
  