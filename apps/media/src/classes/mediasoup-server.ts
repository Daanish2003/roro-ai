import type { Router, Worker } from "mediasoup/node/lib/types";
import { type Config, config } from "../module/config";
import * as mediasoup from "mediasoup";

export class MediasoupServer {
	private config: Config;
	private worker: Worker | null;
	private router: Router | null;


	constructor() {
		this.config = config;
		this.worker = null;
		this.router= null;
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

	async createWebRtcTransport() {
		if (!this.router) return;

		try {
			const transport = await this.router.createWebRtcTransport(
				this.config.mediasoup.webRtcTransport,
			);
			console.log("WebRTC Transport created");
			return transport;
		} catch (error) {
			console.error("Error creating WebRTC transport:", error);
			throw error;
		}
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
