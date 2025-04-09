import { RtpCapabilities } from "mediasoup/node/lib/rtpParametersTypes.js";
import { MediaTransport } from "../../mediasoup/core/media-transport.js";
import { Router } from "mediasoup/node/lib/RouterTypes.js";
import { MediaTrack } from "../../mediasoup/core/media-track.js";
import { AgentPipeline } from "../../pipeline/core/agent-pipeline.js";

export class Room {
	public readonly roomId: string;
	public readonly authorId: string;
	public agent?: AgentPipeline;
	public router: Router;
	private participantId?: string
	public socketId?: string
	public mediaTransports: MediaTransport
	public mediaTracks: MediaTrack
	public prompt: string
	public readonly topic: string

	constructor(roomId: string, topic: string, authorId: string ,router: Router, prompt: string) {
		this.prompt = prompt
		this.roomId = roomId;
		this.topic = topic;
		this.authorId = authorId;
		this.router = router;
		this.mediaTransports = new MediaTransport();
		this.mediaTracks = new MediaTrack()
	}

	public async addParticipant(userId: string, socketId: string): Promise<{success: boolean, message: string, routerRtpCap?: RtpCapabilities}> {
	   if(userId !== this.authorId) {
		  return {
			success: false,
			message: "You are not allowed to join this room",
		  }
	   }

	   this.participantId = userId
	   this.socketId = socketId

	   const routerRtpCap = this.router.rtpCapabilities

	   return {
		 success: true,
		 routerRtpCap,
		 message: "You have successfully joined the room"
	   }
	}

	addAgent(agent: AgentPipeline) {
		this.agent = agent
	}

	public getParticipantId() {
		return this.participantId;
	}


}
