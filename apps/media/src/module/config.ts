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
                },
                {
                    kind: 'video',
                    mimeType: 'video/H264',
                    clockRate: 90000,
                    parameters: 
                    {
                        "packetization-mode"      : 1,
                        "profile-level-id"        : "42e01f",
                        "level-asymmetry-allowed" : 1
                    }
                    
                },
                {
                    kind: 'video',
                    mimeType: 'video/VP8',
                    clockRate: 90000,
                    parameters: {}
                }
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
                    ip: '127.0.0.1'
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