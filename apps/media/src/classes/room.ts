import { Router } from "mediasoup/node/lib/RouterTypes.js";
import { Worker } from "mediasoup/node/lib/WorkerTypes.js";
import { config } from "../config/media-config.js";
import Client from "./client.js";
import { EventEmitter } from "events";

export class Room {
	public roomId: string;
    public router: Router | null
	public client: Client | null
	public eventEmitter: EventEmitter
	public prompt: string
	public topic: string


	constructor(roomId: string, prompt: string, topic: string) {
		this.roomId = roomId;
		this.router = null;
		this.client = null;
		this.eventEmitter = new EventEmitter();
		this.prompt = prompt;
		this.topic = topic;
	}

	public async initialize(worker: Worker) {
		try {
			this.router = await worker.createRouter(config.mediasoup.router);
           
			console.log(this.router)

			console.log(`Room ${this.roomId} initialized`);
		} catch (error) {
			console.error(`Error initializing room ${this.roomId}:`, error);
		}
	}

	public async getRouterRtpCap() {
		if(!this.router) {
			throw new Error("Router is not Initailized")
		}
		const routerRtpCap = this.router.rtpCapabilities;

		return routerRtpCap;
	}

	public addClient(client: Client) {
        if(this.client) {
			throw new Error("Client is already present")
		}
		this.client = client
	}

	public on(event: string, listener: (...args: any[]) => void) {
		this.eventEmitter.on(event, listener);
	}

	public emit(event: string, ...args: any[]) {
		this.eventEmitter.emit(event, ...args);
	  }
	
}
