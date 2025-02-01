import { createRoomHandler, verifyRoomAccessHandler } from "../controllers/room.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { Router } from "express"
import cookieParser from "cookie-parser"

const room_router = Router()

room_router.use(authMiddleware)
room_router.use(cookieParser())
room_router.route("/create-room").post(createRoomHandler)
room_router.route("/:id/verify-access").get(verifyRoomAccessHandler)

export default room_router

