import { Router } from "express";
import * as controller from "./analytics.controller.js";
import { authenticate, authorize } from "../../common/middleware/auth.middleware.js";
import { ROLES } from "../../common/constants.js";

const router = Router();

router.use(authenticate);

router.get("/dashboard", controller.dashboard);
router.get("/polls", controller.pollAnalytics);
router.get("/polls/trending", controller.trendingPolls);
router.get("/quizzes", controller.quizAnalytics);
router.get("/activity", controller.recentActivity);
router.get("/users", authorize(ROLES.ADMIN), controller.userAnalytics);

export default router;
