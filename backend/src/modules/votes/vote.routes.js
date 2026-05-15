import { Router } from "express";
import * as voteController from "./vote.controller.js";
import validate from "../../common/middleware/validate.middleware.js";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import CastVoteDto from "./dto/cast-vote.dto.js";

const router = Router();

router.use(authenticate);

router.post("/", validate(CastVoteDto), voteController.castVote);
router.get("/my-history", voteController.getMyVoteHistory);
router.get("/my-poll/:pollId", voteController.getMyVoteOnPoll);

export default router;
