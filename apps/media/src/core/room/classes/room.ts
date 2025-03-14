import { RtpCapabilities } from "mediasoup/node/lib/rtpParametersTypes.js";
import { routerManager } from "../../mediasoup/managers/media-router-manager.js";

export class Room {
	public readonly roomId: string;
    public readonly routerId: string;
	public readonly authorId: string;
	private participantId: string | null = null
	private producerTransportId: string | null = null
	private consumerTransportId: string | null = null
	private producerTrackId: string | null = null
	private consumerTrackId: string | null = null
	private listenerTrackId: string | null = null
	private agentTrackId: string | null = null
	public readonly topic: string
	public readonly prompt: string


	constructor(roomId: string, topic: string, authorId: string ,routerId: string, prompt: string) {
		this.roomId = roomId;
		this.topic = topic;
		this.prompt = prompt;
		this.authorId = authorId;
		this.routerId = routerId;
	}

	public async addParticipant(userId: string): Promise<{success: boolean, message: string, routerRtpCap?: RtpCapabilities}> {
	   if(userId !== this.authorId) {
		  return {
			success: false,
			message: "You are not allowed to join this room",
		  }
	   }

	   this.participantId = userId

	   const routerRtpCap = await routerManager.getRouterRtpCap(this.routerId)

	   return {
		 success: true,
		 routerRtpCap,
		 message: "You have successfully joined the room"
	   }
	}

	public addProducerTrack(trackId: string) {
		this.producerTrackId = trackId
	}

	public addConsumerTrack(trackId: string) {
		this.consumerTrackId = trackId
	}

	public addListenerTrack(trackId: string) {
		this.listenerTrackId = trackId
	}

	public addAgentTrack(trackId: string) {
		this.agentTrackId = trackId
	}

	public addProducerTransport(transportId: string) {
		this.producerTransportId = transportId
	}

	public addConsumerTransport(transportId: string) {
		this.consumerTransportId = transportId
	}

	public getProducerTransportId() {
		return this.producerTransportId
	}

	public getConsumerTransportId() {
		return this.consumerTransportId
	}

	public getParticipantId() {
		return this.participantId;
	}

	public getProducerTrackId() {
		return this.producerTrackId;
	}

	public getConsumerTrackId() {
		return this.consumerTrackId;
	}

	public getListenerTrackId() {
		return this.listenerTrackId;
	}

	public getAgentTrackId() {
		return this.agentTrackId;
	}


}
