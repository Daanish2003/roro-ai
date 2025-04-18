import { 
    createFeedbackHandler, 
    deleteAllFeedbacksHandler, 
    deleteFeedbackHandler, 
    getAllFeedbacksHandler, 
    getFeedbackCountHandler, 
    getFeedbackHandler 
} from "../controllers/feedback.controller.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { Router } from "express";

const feedback_router: Router = Router()

feedback_router.use(authMiddleware)
feedback_router.route("/get-feedback-count").get(getFeedbackCountHandler)
feedback_router.route("/create-feedback").post(createFeedbackHandler)
feedback_router.use(adminMiddleware)
feedback_router.route("/get-feedback/:id").get(getFeedbackHandler)
feedback_router.route("/get-all-feedbacks").get(getAllFeedbacksHandler)
feedback_router.route("/delete-all-feedback").delete(deleteAllFeedbacksHandler)
feedback_router.route("/delete-feedback/:id").delete(deleteFeedbackHandler)

export default feedback_router