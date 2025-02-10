import { PlainTransportOptions } from "mediasoup/node/lib/PlainTransportTypes.js"
import type { RouterOptions } from "mediasoup/node/lib/RouterTypes.js"
import type { WebRtcTransportOptions } from "mediasoup/node/lib/WebRtcTransportTypes.js"
import type { WorkerSettings } from "mediasoup/node/lib/WorkerTypes.js"


export const config: Config = {
    mediasoup: {
        worker: {
            rtcMinPort: 20000,
            rtcMaxPort: 21000,
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
                    ip: '127.0.0.1',
                },
                {
                    protocol: 'tcp',
                    ip: '127.0.0.1',
                }
            ],
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
        },
        plainTransport: {
            listenInfo: 
                {
                    protocol: 'udp',
                    ip: '127.0.0.1',
                },
            rtcpListenInfo: 
                {
                      protocol: "udp",
                      ip: "0.0.0.0",
                },
            rtcpMux: false,
            comedia: true,
        }
    }
}

export type Config = {
    mediasoup: {
        worker: WorkerSettings,
        router: RouterOptions,
        webRtcTransport: WebRtcTransportOptions,
        plainTransport: PlainTransportOptions
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