import { Router } from "mediasoup/node/lib/RouterTypes.js";
import { Worker } from "mediasoup/node/lib/WorkerTypes.js";
import { config } from "../config/media-config.js";
import Client from "./client.js";

export class Room {
	public roomId: string;
    public router: Router | null
	public client: Client | null

	constructor(roomId: string) {
		this.roomId = roomId;
		this.router = null;
		this.client = null;
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
}
