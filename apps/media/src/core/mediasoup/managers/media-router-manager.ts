import { Router } from "mediasoup/node/lib/RouterTypes.js"

class MediasoupRouterManager {
    private static instance: MediasoupRouterManager
    private routers: Map<string, Router>

    constructor() {
        this.routers = new Map()
    }

    static getInstance() {
        if(!MediasoupRouterManager.instance) {
            MediasoupRouterManager.instance = new MediasoupRouterManager()
        }

        return MediasoupRouterManager.instance
    }

    addRouter(router: Router) {
        try {
            this.routers.set(router.id, router)
        } catch (error) {
            throw new Error(`MediaRouterManager failed to add router ${error}`)
        }
    }

    getRouter(routerId: string) {
        try {
            const router = this.routers.get(routerId)
            return router
        } catch (error) {
            throw new Error(`MediaRouterManager failed to get router ${error}`)
        }
    }

    hasRouter(routerId: string) {
        return this.routers.has(routerId)
    }
    
    async getRouterRtpCap(routerId: string) {
		if(!this.hasRouter(routerId)) {
			throw new Error("Router is not Initailized")
		}
        const router = this.getRouter(routerId) 
		const routerRtpCap = router!.rtpCapabilities;

		return routerRtpCap;
	}
}

export const routerManager = MediasoupRouterManager.getInstance()