import { createRoom } from "src/controllers/room.controller.js"
import { router } from "./index.js"
import { authMiddleware } from "src/middleware/authMiddleware.js"


router.use(authMiddleware)
router.route("/").post(createRoom)