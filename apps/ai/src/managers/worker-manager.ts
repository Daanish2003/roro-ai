import os from "os"
import { createWorker} from "mediasoup"
import { config } from "../config/media-config.js";
import { Worker } from "mediasoup/node/lib/WorkerTypes.js";

class MediasoupWorkerManager {
    private static instance: MediasoupWorkerManager;
    private workers: Worker[];
    private totalThreads: number;

    private constructor() {
        this.workers = []
        this.totalThreads = os.cpus().length
    }

    public static getInstance(): MediasoupWorkerManager {
        if (!MediasoupWorkerManager.instance) {
            MediasoupWorkerManager.instance = new MediasoupWorkerManager();
        }
        return MediasoupWorkerManager.instance;
    }

    public async createWorkers(): Promise<Worker[]> {
      if(this.workers.length > 0) {
        return this.workers
      }

      for (let i = 0; i < this.totalThreads; i++) {
        try {
            const worker = await createWorker(config.mediasoup.worker)

            worker.on('died', () => {
                console.error("Worker has died, restarting...");
                process.exit(1);
            });

            this.workers.push(worker)

        } catch (error) {
            console.error(`Error creating worker ${i}:`, error);
        }
      }

      return this.workers
    }

    public async getWorker(): Promise<Worker> {
        if (this.workers.length === 0 ) {
            throw new Error("No workers available. Please initialize workers first")
        }

        const workersLoad = await Promise.all(
            this.workers.map(async (worker) => {
                const stats = await worker.getResourceUsage()
                return stats.ru_utime + stats.ru_stime
            })
        );

        const leastLoadedWorkerIndex = workersLoad.indexOf(Math.min(...workersLoad));

        const worker =  this.workers[leastLoadedWorkerIndex]

        if (!worker) {
            throw new Error("No available worker found");
        }

        return worker
    }
}

export const mediasoupWorkerManager = MediasoupWorkerManager.getInstance()