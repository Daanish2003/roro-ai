import { config } from "../config/media-config.js";
import { Consumer } from "mediasoup/node/lib/ConsumerTypes.js";
import { Producer } from "mediasoup/node/lib/ProducerTypes.js"
import { DtlsParameters, WebRtcTransport } from "mediasoup/node/lib/WebRtcTransportTypes.js"
import { Room } from "./room.js";
import { MediaKind, RtpCapabilities, RtpParameters } from "mediasoup/node/lib/rtpParametersTypes.js";


class Client {
    userId: string
    username: string
    sendTransport: WebRtcTransport | null
    recieveTransport: WebRtcTransport | null
    producer: Producer | null
    consumer: Consumer | null
    room: Room | null

    constructor(username: string, userId: string) {
        this.userId = userId
        this.username = username;
        this.recieveTransport = null;
        this.sendTransport = null;
        this.producer = null;
        this.consumer = null;
        this.room = null
    }

    public async createClientTransport(
        type: 'producer' | 'consumer'
    ) {
        if(!this.room?.router) {
            throw new Error("Router is not initiailized for the room")
        } 

        try {
            const transport = await this.room.router.createWebRtcTransport(config.mediasoup.webRtcTransport)

            const clientTransportParams = {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters,
            };

            if(type === "producer") {
                this.sendTransport = transport;
            } else if (type === "consumer") {
                this.recieveTransport = transport;
            }

            return clientTransportParams
        } catch (error) {
            console.error("Failed to add transport", error)
            throw error
        }

    }

    public async connectClientTransport(
            {
                dtlsParameters,
                type
            }: {
                dtlsParameters: DtlsParameters,
                type: 'producer' | 'consumer'
            }
        ) {
    
            if (type === 'producer') {
                try {
                    if(!this.sendTransport) {
                     throw new Error("Create Producer Not Initialized")
                    }
         
                     await this.sendTransport.connect({dtlsParameters})
                 } catch (error) {
                     console.error("Error connecting WebRTC transport:", error)
                     throw new Error("Error connecting webRTC transport")
                 }
            } else if (type === 'consumer') {
                try {
                    if(!this.recieveTransport) {
                     throw new Error("Create Consumer Not Initialized")
                    }
         
                     await this.recieveTransport.connect({dtlsParameters})
                 } catch (error) {
                     console.error("Error connecting WebRTC transport:", error)
                     throw new Error("Error connecting webRTC transport")
                 }
            }
        }

    public async produce(
            {
                kind,
                rtpParameters
            } : {
                kind: MediaKind,
                rtpParameters: RtpParameters
            }
        ) {
            try {
                if(!this.sendTransport) {
                    throw new Error("Create Producer Not Initialized")
                }

                if(!this.room) {
                    throw new Error("Room not found")
                }
    
                this.producer = await this.sendTransport.produce({ kind, rtpParameters })

    
                this.producer.on('transportclose',()=>{
                    if (!this.producer) {
                        throw new Error("Client Producer Not Found")
                    }
                    console.log("Producer transport closed. Just fyi")
                    this.producer.close()
                })  
    
                return this.producer.id
    
            } catch (error) {
                console.error("Error start produce WebRTC transport:", error)
                throw new Error("Error start produce webRTC transport")
            }
        }
    
    public async consume(
            {
                rtpCapabilities
            }: {
                rtpCapabilities: RtpCapabilities
            }
        ) {
            if(!this.producer) {
                return {
                    message : "noProducer"
                }
            }
            
            if(!this.room) {
                throw new Error("Room is not created")
            }
                
            if (!this.room.router?.canConsume({producerId: this.producer.id, rtpCapabilities})) {
                return {
                    message: "cannotConsume"
                }
            }
    
            if(!this.recieveTransport) {
                throw new Error("Create Consumer Not Initialized")
            }

            if(!this.room.ai) {
                throw new Error("Ai is not connected")
            }

            if(!this.room.ai.producer) {
                throw new Error("Ai is not have producer")
            }
                    
            this.consumer = await this.recieveTransport.consume({
                producerId: this.room.ai.producer.id,
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
    
            const consumerParams = {
                producerId: this.producer.id,
                id: this.consumer.id,
                kind:this.consumer.kind,
                rtpParameters: this.consumer.rtpParameters,
            }
    
            return consumerParams
        }
}

export default Client;