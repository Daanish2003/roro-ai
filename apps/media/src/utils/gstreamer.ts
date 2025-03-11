import { spawn, ChildProcessWithoutNullStreams } from "child_process";

type PCMCallback = (pcmData: Buffer) => void;
type OpusCallback = (opusData: Buffer) => void;

class GStreamerPipeline {
  private static instance: GStreamerPipeline;

  private gstreamerOpusToPcm: ChildProcessWithoutNullStreams | null = null;
  private gstreamerPcmToOpus: ChildProcessWithoutNullStreams | null = null;

  private constructor() {}

  static getInstance(): GStreamerPipeline {
    if (!GStreamerPipeline.instance) {
      GStreamerPipeline.instance = new GStreamerPipeline();
    }
    return GStreamerPipeline.instance;
  }

  /**
   * ✅ Convert Opus to PCM (Linear16)
   */
  opusToPcm(onPCMData: PCMCallback) {
    if (this.gstreamerOpusToPcm) {
      console.warn("Opus-to-PCM pipeline already running.");
      return;
    }

    console.log("Starting Opus-to-PCM pipeline...");

    this.gstreamerOpusToPcm = spawn("gst-launch-1.0", [
      "fdsrc", // Read from stdin
      "!", "rtpopusdepay", // Depayload RTP packets with Opus
      "!", "opusdec", // Decode Opus to raw audio
      "!", "audioconvert", // Convert to raw audio format
      "!", "audioresample", // Resample audio
      "!", "audio/x-raw,format=S16LE,rate=16000,channels=1", // PCM Linear16 format
      "!", "fdsink" // Output to stdout (for real-time)
    ]);

    this.gstreamerOpusToPcm.stderr.on("data", (data) => {
      console.error(`Opus-to-PCM error: ${data}`);
    });

    this.gstreamerOpusToPcm.stdout.on("data", (pcmData) => {
      console.log(`Decoded PCM Data: ${pcmData.length} bytes`);
      onPCMData(pcmData);
    });

    this.gstreamerOpusToPcm.on("close", (code) => {
      console.log(`Opus-to-PCM pipeline closed with code ${code}`);
      this.gstreamerOpusToPcm = null;
    });
  }

  /**
   * ✅ Convert PCM (Linear16) to Opus
   */
  pcmToOpus(onOpusData: OpusCallback) {
    if (this.gstreamerPcmToOpus) {
      console.warn("PCM-to-Opus pipeline already running.");
      return;
    }

    console.log("Starting PCM-to-Opus pipeline...");

    this.gstreamerPcmToOpus = spawn("gst-launch-1.0", [
      "fdsrc", // Read from stdin
      "!", "audio/x-raw,format=S16LE,rate=16000,channels=1", // PCM Linear16 format
      "!", "audioconvert", // Convert to raw audio format
      "!", "audioresample", // Resample audio
      "!", "opusenc", // Encode to Opus format
      "!", "rtpopuspay", // Payload RTP packets with Opus
      "!", "fdsink" // Output to stdout (for real-time)
    ]);

    this.gstreamerPcmToOpus.stderr.on("data", (data) => {
      console.error(`PCM-to-Opus error: ${data}`);
    });

    this.gstreamerPcmToOpus.stdout.on("data", (opusData) => {
      console.log(`Encoded Opus Data: ${opusData.length} bytes`);
      onOpusData(opusData);
    });

    this.gstreamerPcmToOpus.on("close", (code) => {
      console.log(`PCM-to-Opus pipeline closed with code ${code}`);
      this.gstreamerPcmToOpus = null;
    });
  }

  /**
   * ✅ Stop both pipelines
   */
  stop() {
    if (this.gstreamerOpusToPcm) {
      console.log("Stopping Opus-to-PCM pipeline...");
      this.gstreamerOpusToPcm.stdin.end();
      this.gstreamerOpusToPcm.kill();
      this.gstreamerOpusToPcm = null;
    }

    if (this.gstreamerPcmToOpus) {
      console.log("Stopping PCM-to-Opus pipeline...");
      this.gstreamerPcmToOpus.stdin.end();
      this.gstreamerPcmToOpus.kill();
      this.gstreamerPcmToOpus = null;
    }
  }

  /**
   * ✅ Write RTP data to the Opus-to-PCM pipeline
   */
  writeOpus(data: Buffer) {
    if (this.gstreamerOpusToPcm?.stdin.writable) {
      this.gstreamerOpusToPcm.stdin.write(data);
    } else {
      console.error("Opus-to-PCM pipeline stdin not writable");
    }
  }

  /**
   * ✅ Write PCM data to the PCM-to-Opus pipeline
   */
  writePCM(data: Buffer) {
    if (this.gstreamerPcmToOpus?.stdin.writable) {
      this.gstreamerPcmToOpus.stdin.write(data);
    } else {
      console.error("PCM-to-Opus pipeline stdin not writable");
    }
  }
}

export const audioPipeline = GStreamerPipeline.getInstance();
