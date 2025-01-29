import { createClient, type ListenLiveClient, type DeepgramClient, LiveTranscriptionEvents } from "@deepgram/sdk"
import "dotenv/config"

export class DeepgramSTT {
    private deepgram: DeepgramClient;
    private connections: Map<string, ListenLiveClient>

    constructor() {
        if (!process.env.DEEPGRAM_API_KEY) {
            throw new Error("Deepgram API key is missing.");
        }
      this.deepgram = createClient(process.env.DEEPGRAM_API_KEY)
      this.connections = new Map<string, ListenLiveClient>()
    }

    public dgSocket(roomId: string) {
        if (this.connections.has(roomId)) {
            return this.connections.get(roomId)
        }

        const connection = this.deepgram.listen.live({
            model: 'nova-2-conversationalai',
            punctuate: true,
            smart_format: true,
            interim_results: true,
            channels: 1,
            encoding: 'opus',
            sample_rate: 16000,
            filler_words: false,
            language: 'en-US',
            vad_events: true,
            utterance_end_ms: 1000,
            endpointing: 25,
            no_delay: true,
            profanity_filter: false,
        })

        connection.on(LiveTranscriptionEvents.Open, () => {
            console.log("Deepgram connected")
            connection.on(LiveTranscriptionEvents.Close, () => {
                console.log("Connection closed.");
            })
        })

        connection.on(LiveTranscriptionEvents.Transcript, (data) => {
            console.log(`Room ${roomId} Transcription:`, data.channel.alternatives[0].transcript)
        })

        

        connection.on(LiveTranscriptionEvents.Metadata, (data) => {
            console.log(data);
          });

        connection.on(LiveTranscriptionEvents.Error, (err) => {
            console.error(`Deepgram Error in Room ${roomId}:`, err)
        })

        this.connections.set(roomId, connection)

        return connection
    }

    public sendAudio(roomId: string, audioBuffer: Buffer) {
        const connection = this.connections.get(roomId)

        if(connection) {
            connection.send(audioBuffer);
        }
    }

    public closeConnection(roomId: string) {
        const connection = this.connections.get(roomId);
        if (connection) {
            connection.requestClose();
            this.connections.delete(roomId);
        }
    }
}

