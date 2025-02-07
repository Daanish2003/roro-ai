import { config } from "../config/media-config.js";
import { Consumer } from "mediasoup/node/lib/ConsumerTypes.js";
import { Producer } from "mediasoup/node/lib/ProducerTypes.js"
import { Room } from "./room.js";
import { RtpCapabilities } from "mediasoup/node/lib/rtpParametersTypes.js";
import { PlainTransport } from "mediasoup/node/lib/PlainTransportTypes.js";


class Ai {
    plainTransport: PlainTransport | null
    producer: Producer | null
    consumer: Consumer | null
    room: Room | null

    constructor() {
        this.plainTransport = null
        this.producer = null;
        this.consumer = null;
        this.room = null
    }

    public async createAiPlainTransport(
    ) {
        if(!this.room?.router) {
            throw new Error("Router is not initiailized for the room")
        } 

        try {
            this.plainTransport = await this.room.router.createPlainTransport(config.mediasoup.plainTransport)

            const clientTransportParams = {
                ip: this.plainTransport.tuple.localIp,
                port: this.plainTransport.tuple.localPort,
                rtcpPort: this.plainTransport.rtcpTuple?.localPort
            };

            return clientTransportParams
        } catch (error) {
            console.error("Failed to add transport", error)
            throw error
        }

    }

    public async connectClientPlainTransport(
            plainParams : {
                ip: string,
                port: number,
                rtcpPort: number | undefined
             }
        ) {
            try {
                if(!this.plainTransport) {
                    throw new Error("Plain is not defined")
                }
                await this.plainTransport.connect({
                    ip: plainParams.ip,
                    port: plainParams.port,
                    rtcpPort: plainParams.rtcpPort
                })

                return {
                    success: true
                }
            } catch (error) {
                throw new Error("Failed to connect to client plain transport", error as Error)
            }
    }

    public async AiAudioproduce() {
            try {
                if(!this.plainTransport) {
                    throw new Error("Create Producer Not Initialized")
                }
    
                this.producer = await this.plainTransport.produce(
                    { 
                        kind: 'audio', 
                        rtpParameters : {
                            codecs: [
                                {
                                    mimeType: 'video/VP8',
                                    payloadType: 101,
                                    clockRate: 90000
                                }
                            ],
                            encodings: [
                                {
                                    ssrc: 11111111
                                }
                            ]
                        }
                    }
                )

                this.producer.on('score', (score) => {
                    console.log('Server B - Producer score:', score);
                });
    
                console.log('Server B - Producer created:', this.producer.id);
    
                return this.producer
    
            } catch (error) {
                console.error("Error start produce WebRTC transport:", error)
                throw new Error("Error start produce webRTC transport")
            }
        }
    
    public async AiConsume(
            {
                producerId,
                rtpCapabilities
            }: {
                producerId:string
                rtpCapabilities: RtpCapabilities
            }
        ) {
            
            if(!this.room) {
                throw new Error("Room is not created")
            }
                
            if (!this.room.router?.canConsume({producerId: producerId, rtpCapabilities})) {
                return {
                    message: "cannotConsume"
                }
            }

            if(!this.plainTransport) {
                throw new Error("Plain Transport not initailized")
            }

                    
            this.consumer = await this.plainTransport.consume({
                producerId,
                rtpCapabilities,
                paused: true,
            })
    
            this.consumer.on('transportclose', () => {
                if(!this.consumer) {
                    throw new Error("Consumer not found")
                }
                console.log("Consumer transport closed")
                this.consumer.close()
            })

    
            return this.consumer
        }
}

export default Ai;