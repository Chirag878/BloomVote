import { Router } from "express";
import * as controller from "./quiz.controller.js";
import validate from "../../common/middleware/validate.middleware.js";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import {
    CreateQuizDto,
    UpdateQuizDto,
    CreateQuestionDto,
    SubmitAttemptDto,
} from "./dto/quiz.dto.js";

const router = Router();

router.get("/share/:shareSlug", controller.getQuizByShareSlug);
router.get("/", controller.getQuizzes);
router.get("/:quizId", controller.getQuizById);

router.use(authenticate);

router.get("/mine", controller.getMyQuizzes);
router.get("/attempts/me", controller.getMyAttempts);
router.post("/", validate(CreateQuizDto), controller.createQuiz);
router.patch("/:quizId", validate(UpdateQuizDto), controller.updateQuiz);
router.delete("/:quizId", controller.deleteQuiz);
router.get("/:quizId/questions", controller.getQuestions);
router.post("/:quizId/questions", validate(CreateQuestionDto), controller.addQuestion);
router.post("/:quizId/publish", controller.publishQuiz);
router.post("/:quizId/attempts", validate(SubmitAttemptDto), controller.submitAttempt);
router.get("/:quizId/analytics", controller.getQuizAnalytics);

export default router;
