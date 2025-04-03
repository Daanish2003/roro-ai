import { createWorker } from "mediasoup";
import { config } from "../../config/media-config.js";

export const createMediasoupWorker = async () => {
    try {
        const worker = await createWorker(config.mediasoup.worker)
    
        worker.on('died', () => {
            console.error("Worker has died, restarting...");
            process.exit(1);
        });
    
        return worker 
    } catch (error) {
        throw new Error(`Error creating worker: ${error}`);
    }
}