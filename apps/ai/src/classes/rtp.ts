// Initialize RTP header state (adjust these based on your negotiated values)
let sequenceNumber = 0;
let timestamp = 0;
const ssrc = Math.floor(Math.random() * 0xffffffff); // use a random SSRC
// Use the payload type negotiated for Opus; for example, 111 is common but adjust as needed.
const payloadType = 100;

// Function to create an RTP packet with a header extension for "mid"
export function createRtpPacketWithExtension(opusPayload: Buffer, midValue: number) {
  // Allocate 12 bytes for the basic RTP header.
  const rtpHeader = Buffer.alloc(12);
  // Byte 0: Version (2 bits = 2), Padding (0), Extension (1), CSRC count (0)
  // 0xA0 = 10100000 in binary.
  rtpHeader[0] = 0xA0;
  // Byte 1: Marker (set to 1 if needed; here we keep it high as in your original code) + Payload Type (7 bits)
  rtpHeader[1] = (0x80 | (payloadType & 0x7f));
  // Bytes 2-3: Sequence Number (big-endian)
  rtpHeader.writeUInt16BE(sequenceNumber++, 2);
  // Bytes 4-7: Timestamp (big-endian)
  rtpHeader.writeUInt32BE(timestamp, 4);
  // For Opus at 48 kHz, using 20 ms frames, increment timestamp by 960 per frame.
  timestamp += 960;
  // Bytes 8-11: SSRC (big-endian)
  rtpHeader.writeUInt32BE(ssrc, 8);

  // --- Build the RTP header extension ---
  // According to RFC 5285, a one-byte header extension has:
  // • 4 bytes: 2-byte profile (commonly 0xBEDE) and 2-byte length (in 32-bit words, excluding header)
  const extHeader = Buffer.alloc(4);
  extHeader.writeUInt16BE(0xBEDE, 0); // one-byte header extension profile
  // We'll include one extension element.
  // The extension data length is specified in 32-bit words. Our extension element will be 2 bytes of useful data + 2 bytes of padding = 4 bytes.
  // Thus, length = 1 (i.e. 1 * 32 bits = 4 bytes).
  extHeader.writeUInt16BE(1, 2);

  // Now, create the extension element for "mid".
  // In the one-byte header extension format:
  // • The first byte: upper 4 bits = extension ID (we use 1 for mid), lower 4 bits = length of the element data minus 1.
  //   For 1 byte of data, length field = 0.
  // • Followed by the extension data (here, the midValue as one byte).
  // • We need to pad to reach a 4-byte boundary for the entire extension block.
  const extElement = Buffer.alloc(4);
  extElement[0] = (1 << 4) | 0; // ID = 1, data length = 1 byte (0 means 1 byte)
  extElement[1] = midValue;     // The mid value you want to transmit.
  // The remaining 2 bytes (extElement[2] and extElement[3]) are left as 0 for padding.

  // --- Combine all parts into one RTP packet ---
  return Buffer.concat([rtpHeader, extHeader, extElement, opusPayload]);
}
