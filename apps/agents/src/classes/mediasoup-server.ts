import type { Router, Worker } from "mediasoup/node/lib/types";
import type { Config } from "../module/config";
import * as mediasoup from "mediasoup";
import logger from "../module/logger";

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
        this.worker = await mediasoup.createWorker(this.config.mediasoup.worker)
        this.router = await this.worker.createRouter(this.config.mediasoup.router)

        this.worker.on('died', () => {
            logger.error('Mediasoup worker died, exiting')
            process.exit(1)
        })
    }

    async createWebRtcTransport() {
        if(!this.router) {
            throw new Error('Router not initialized')
        }

        return await this.router.createWebRtcTransport(
            this.config.mediasoup.webRtcTransport
        )
    }

    public getRtpCapabilities() {
        return this.router?.rtpCapabilities || null
    }

    public close() {
       this.worker?.close();
       this.router?.close();
    }
}