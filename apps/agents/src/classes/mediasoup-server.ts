import type { Router, Worker } from "mediasoup/node/lib/types.js";
import type { Config } from "../module/config.js";
import * as mediasoup from "mediasoup";
import logger from "../module/logger.js";

export class MediasoupServer {
    private config: Config;
    private worker: Worker | null;
    private router: Router | null;

    constructor(config: Config) {
      this.config = config
      this.worker = null;
      this.router = null;
    }

    public async initialize() {
        try {
            this.worker = await mediasoup.createWorker(this.config.mediasoup.worker);
            this.router = await this.worker.createRouter(this.config.mediasoup.router);

            this.worker.on('died', () => {
                logger.error('Mediasoup worker died, exiting');
                process.exit(1);
            });

            console.log('Mediasoup Server initialized');
        } catch (error) {
            logger.error('Error initializing Mediasoup server:', error);
            throw error;
        }
    }

    async createWebRtcTransport() {
        if(!this.router) {
            throw new Error('Router not initialized')
        }

        try {
            const transport = await this.router.createWebRtcTransport(this.config.mediasoup.webRtcTransport);
            console.log("WebRTC Transport created");
            return transport;
        } catch (error) {
            console.error('Error creating WebRTC transport:', error);
            throw error;
        }
    }

    public getRtpCapabilities() {
        return this.router?.rtpCapabilities || null
    }

    public close(): void {
        if (this.worker) {
            this.worker.close();
        }
        if (this.router) {
            this.router.close();
        }
        console.log('Mediasoup server closed');
    }
}