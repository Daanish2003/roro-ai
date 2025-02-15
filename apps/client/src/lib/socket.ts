import { io, type Socket } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_MEDIA_URL;

export const socket: Socket = io(URL, {
	withCredentials: true,
	autoConnect: false

});