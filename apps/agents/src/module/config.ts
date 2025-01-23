import type { RouterOptions } from "mediasoup/node/lib/RouterTypes"
import type { WebRtcTransportOptions } from "mediasoup/node/lib/WebRtcTransportTypes"
import type { WorkerSettings } from "mediasoup/node/lib/WorkerTypes"


export const config: Config = {
    mediasoup: {
        worker: {
            rtcMinPort: 10000,
            rtcMaxPort: 10100,
            logLevel: 'warn',
            logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp']
        },
        router: {
            mediaCodecs: [
                {
                    kind: 'audio',
                    mimeType: 'audio/opus',
                    clockRate: 48000,
                    channels: 2
                }
            ]
        },
        webRtcTransport: {
            listenIps: [
                {
                    ip: '0.0.0.0',
                    announcedIp: '127.0.0.1'
                }
            ],
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
        }
    }
}

export type Config = {
    mediasoup: {
        worker: WorkerSettings,
        router: RouterOptions,
        webRtcTransport: WebRtcTransportOptions
    }
}