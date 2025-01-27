import type { Consumer, DtlsParameters, MediaKind, Producer, Router, RtpCapabilities, RtpParameters, WebRtcTransport, Worker } from "mediasoup/node/lib/types";
import { type Config, config } from "../module/config";
import * as mediasoup from "mediasoup";

export class MediasoupServer {
	private config: Config;
	private worker: Worker | null;
	private router: Router | null;
	private clientProducerTransport: WebRtcTransport | null
	private clientProducer:  Producer | null
	private clientConsumerTransport: WebRtcTransport | null
	private clientConsumer: Consumer | null
	private producer: Producer | null


	constructor() {
		this.config = config;
		this.worker = null;
		this.router= null;
		this.clientProducerTransport = null;
		this.clientProducer = null;
		this.clientConsumerTransport = null;
		this.clientConsumer = null;
		this.producer = null;
	}

	public async initialize() {

		try {
			this.worker = await mediasoup.createWorker(this.config.mediasoup.worker);
            this.router = await this.worker.createRouter(this.config.mediasoup.router);

			this.worker.on("died", () => {
				console.error("Mediasoup worker died, exiting");
				process.exit(1);
			});

			console.log("Mediasoup Server initialized");
		} catch (error) {
			console.error("Error mediasoup server", error);
			throw new Error("Error Initializing mediasoup server");
		}
	}

	public async createWebRtcTransport(direction: 'send' | 'recieve') {
		if (!this.router) {
			throw new Error("Router not Initialized")
		};

		try {
			const transport = await this.router.createWebRtcTransport(
				this.config.mediasoup.webRtcTransport,
			);

			if (direction === 'send') {
                this.clientProducerTransport = transport
			} 

			if (direction === 'recieve') {
				this.clientConsumerTransport = transport
			}

			const clientTransportParams = {
				id: transport.id,
				iceParameters: transport.iceParameters,
				iceCandidates: transport.iceCandidates,
				dtlsParameters: transport.dtlsParameters,
			}

			return clientTransportParams

		} catch (error) {
			console.error("Error creating WebRTC transport:", error);
			throw error;
		}
	}

	public async connectTransport(
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
				if(!this.clientProducerTransport) {
				 throw new Error("Create Producer Not Initialized")
				}
	 
				 await this.clientProducerTransport.connect({dtlsParameters})
			 } catch (error) {
				 console.error("Error connecting WebRTC transport:", error)
				 throw new Error("Error connecting webRTC transport")
			 }
		} else if (type === 'consumer') {
			try {
				if(!this.clientConsumerTransport) {
				 throw new Error("Create Consumer Not Initialized")
				}
	 
				 await this.clientConsumerTransport.connect({dtlsParameters})
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
			if(!this.clientProducerTransport) {
				throw new Error("Create Producer Not Initialized")
			}

			this.clientProducer = await this.clientProducerTransport.produce({ kind, rtpParameters })

			this.producer = this.clientProducer

			this.clientProducer.on('transportclose',()=>{
				if (!this.clientProducer) {
					throw new Error("Client Producer Not Found")
				}
                console.log("Producer transport closed. Just fyi")
                this.clientProducer.close()
            })  

			return this.clientProducer.id

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
			
		if (!this.router?.canConsume({producerId: this.producer.id, rtpCapabilities})) {
			return {
				message: "cannotConsume"
		    }
		}

		if(!this.clientConsumerTransport) {
			throw new Error("Create Consumer Not Initialized")
		}
				
		this.clientConsumer = await this.clientConsumerTransport.consume({
			producerId: this.producer.id,
			rtpCapabilities,
			paused: true,
		})

		this.clientConsumer.on('transportclose', () => {
			if(!this.clientConsumer) {
				throw new Error("Consumer not found")
		    }
			console.log("Consumer transport closed. Just fyi")
            this.clientConsumer.close()
		})

        const consumerParams = {
			producerId: this.producer.id,
			id: this.clientConsumer.id,
			kind:this.clientConsumer.kind,
			rtpParameters: this.clientConsumer.rtpParameters,
		}

		return consumerParams
	}



	public getRtpCapabilities() {
		if(!this.router) {
			throw new Error("Router not initialized")
		}

		return this.router.rtpCapabilities;
	}

	public close(): void {
		this.worker?.close()
		this.router?.close()

		console.log("Mediasoup server closed");
	}
}
