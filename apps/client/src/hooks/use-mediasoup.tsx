import * as mediasoupClient from 'mediasoup-client'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useSocket } from './use-socket';

interface MediasoupContextType {
    device: mediasoupClient.types.Device | null;
    producer: mediasoupClient.types.Producer | null;
    consumer: mediasoupClient.types.Consumer | null;
    produce: (stream: MediaStream) => Promise<void>;
    consume: () => Promise<void>
}

const MediasoupContext = createContext<MediasoupContextType | undefined>(undefined);

interface MediasoupProviderProps {
    children: ReactNode;
}

export const MediasoupProvider = ({ children }: MediasoupProviderProps) => {
    const { socket } = useSocket();
    const [device, setDevice] = useState<MediasoupContextType['device'] | null>(null);
    const [producer, setProducer] = useState<MediasoupContextType['producer'] | null>(null);
    const [consumer, setConsumer] = useState<MediasoupContextType['consumer'] | null>(null);

    useEffect(() => {
        const initializeMediasoup = async () => {
            if (!socket) return;

            try {
                const { routerRtpCapabilities } = await socket.emitWithAck('getRouterRtpCapabilities');
                const mediasoupDevice = new mediasoupClient.Device()
                await mediasoupDevice.load({ routerRtpCapabilities })

                setDevice(mediasoupDevice);

            } catch (error) {
                console.error('Error initializing Mediasoup:', error);
            }
        };

        initializeMediasoup()
    }, [socket])

    const produce = async (stream: MediaStream) => {
        if (!device || !socket) return;

        const transportOptions = await socket.emitWithAck('createProducerTransport')
        const producerTransport = device.createSendTransport(transportOptions)


        producerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
            try {
                await socket.emit('connectProducerTransport', { dtlsParameters });
                callback();
            } catch (error) {
                errback(error as Error)
            }
        })

        producerTransport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
            try {
                const { id } = await socket.emitWithAck('produce', { kind, rtpParameters });
                callback({ id })
            } catch (error) {
                errback(error as Error)
            }
        });

        const track = stream.getTracks()[0];
        const newProducer = await producerTransport.produce({ track })

        setProducer(newProducer)
    }

    const consume = async () => {
        if (!device || !socket) return;

        const consumerOptions = await socket.emitWithAck('createConsumerTransport');
        const consumerTransport = device.createRecvTransport(consumerOptions)

        consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
            try {
                await socket.emitWithAck('connectConsumerTransport', { dtlsParameters })
                callback()
            } catch (error) {
                errback(error as Error)
            }
        });

        const { id, producerId, kind, rtpParameters } = await socket.emitWithAck('consume')
        const newConsumer = await consumerTransport.consume({
            id,
            producerId,
            kind,
            rtpParameters
        })

        setConsumer(newConsumer)
    };

    return (
        <MediasoupContext.Provider value={{ device, producer, consumer, consume, produce}}>
            {children}
        </MediasoupContext.Provider>
    )
}

export const useMediasoup = (): MediasoupContextType => {
    const context = useContext(MediasoupContext);
    if (!context) {
        throw new Error('useMediasoup must be used within a MediasoupProvider');
    }
    return context;
};