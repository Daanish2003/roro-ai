import { Worker } from "mediasoup/node/lib/types.js";
import { config } from "../../config/media-config.js";

export const createMediasoupRouter = async (worker: Worker) => {
    try {
        const router = await worker.createRouter(config.mediasoup.router)

        router.on("@close", () => {
            console.log(`Router [${router.id}] for worker [${worker.pid}] has been closed`)
        })

        return router
    } catch (error) {
        throw new Error(`Error create a router: ${error}`)
    }
}