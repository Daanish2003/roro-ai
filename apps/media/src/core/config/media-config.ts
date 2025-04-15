import type { RouterOptions } from "mediasoup/node/lib/RouterTypes.js"
import type { WebRtcTransportOptions } from "mediasoup/node/lib/WebRtcTransportTypes.js"
import type { WorkerSettings } from "mediasoup/node/lib/WorkerTypes.js"


export const config: Config = {
    mediasoup: {
        worker: {
            rtcMinPort: 40000,
            rtcMaxPort: 41000,
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
                },
            ]
        },
        webRtcTransport: {
            listenInfos: [
                {
                    protocol: 'udp',
                    ip: '0.0.0.0',
                    announcedAddress: process.env.TRANSPORT_ADDRESS
                },
                {
                    protocol: 'tcp',
                    ip: '0.0.0.0',
                    announcedAddress: process.env.TRANSPORT_ADDRESS
                },

            ],
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
        },
    }
}

export type Config = {
    mediasoup: {
        worker: WorkerSettings,
        router: RouterOptions,
        webRtcTransport: WebRtcTransportOptions,
    }
}


export type STTModels =
  | 'nova-2-conversationalai'

export type STTLanguages =
  | 'en'
  | 'en-AU'
  | 'en-GB'
  | 'en-IN'
  | 'en-NZ'
  | 'en-US'
;