import os from "os"
import { Worker } from "mediasoup/node/lib/WorkerTypes.js";
import { createMediasoupWorker } from "../functions/media-worker.js";

class MediasoupWorkerManager {
    private static instance: MediasoupWorkerManager;
    private workers: Map<number, Worker>;
    private totalThreads: number;

    private constructor() {
        this.workers = new Map();
        this.totalThreads = os.cpus().length
    }

    static getInstance(): MediasoupWorkerManager {
        if (!MediasoupWorkerManager.instance) {
            MediasoupWorkerManager.instance = new MediasoupWorkerManager();
        }
        return MediasoupWorkerManager.instance;
    }

    async createWorkers(): Promise<void> {
      for (let i = 0; i < this.totalThreads; i++) {
        const worker = await createMediasoupWorker()
        this.workers.set(i, worker)
      }
    }

    async getAvailableWorker(): Promise<Worker> {
        if (this.workers.size === 0) {
            throw new Error("No workers available. Please initialize workers first");
        }

        let leastLoadedWorkerIndex: number | null = null;
        let minLoad = Infinity;

        for (const [index, worker] of this.workers) {
            const stats = await worker.getResourceUsage();
            const load = stats.ru_utime + stats.ru_stime;

            if (load < minLoad) {
                minLoad = load;
                leastLoadedWorkerIndex = index;
            }
        }

        if (leastLoadedWorkerIndex === null) {
            throw new Error("No available worker found");
        }

        return this.getWorker(leastLoadedWorkerIndex)!;
    }

    private getWorker(index: number) {
        return this.workers.get(index)
    }


}

export const mediasoupWorkerManager = MediasoupWorkerManager.getInstance()