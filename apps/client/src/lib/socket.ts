import { io, type Socket } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_MEDIA_URL;
const AIURL = process.env.NEXT_PUBLIC_AI_URL;

export const socket: Socket = io(URL, {
	withCredentials: true,
	autoConnect: false

});

export const AiSocket: Socket = io(AIURL, {
	withCredentials: true,
	autoConnect: false
})