import { Router } from "express";
import * as controller from "./poll.controller.js";
import validate from "../../common/middleware/validate.middleware.js";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { CreatePollDto, UpdatePollDto } from "./dto/poll.dto.js";

const router = Router();

router.get("/", controller.getPolls);
router.get("/share/:shareSlug", controller.getPollByShareSlug);
router.post("/", authenticate, validate(CreatePollDto), controller.createPoll);
router.get("/:pollId", controller.getPollById);
router.patch("/:pollId", authenticate, validate(UpdatePollDto), controller.updatePoll);
router.delete("/:pollId", authenticate, controller.deletePoll);
router.get("/:pollId/analytics", authenticate, controller.getPollAnalytics);

export default router;
