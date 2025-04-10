import { createRoomHandler, deleteAllRoomHandler, deleteRoomHandler, getAllUserRoomHandler, getRoomCountHandler, getUserRoomHandler, verifyRoomAccessHandler } from "../controllers/room.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { Router } from "express"
import cookieParser from "cookie-parser"

const room_router: Router = Router()

room_router.use(cookieParser())
room_router.use(authMiddleware)
room_router.route("/create-room").post(createRoomHandler)
room_router.route("/verify-access/:id").get(verifyRoomAccessHandler)
room_router.route("/get-rooms/:id").get(getUserRoomHandler)
room_router.route("/get-room-count").get(getRoomCountHandler)
room_router.route("/get-all-rooms").get(getAllUserRoomHandler)
room_router.route("/delete-all-room").delete(deleteAllRoomHandler)
room_router.route("/delete-room/:id").delete(deleteRoomHandler)

export default room_router