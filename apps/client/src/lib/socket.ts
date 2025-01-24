import { io, type Socket } from "socket.io-client";

const URL = "http://localhost:5000";

export const socket: Socket = io(URL, {
	withCredentials: true,
	autoConnect: false
});