import { Router } from "express";
import * as controller from "./auth.controller.js";
import validate from "../../common/middleware/validate.middleware.js";
import { authenticate, authorize } from "../../common/middleware/auth.middleware.js";
import LoginDto from "./dto/login.dto.js";
import RegisterDto from "./dto/register.dto.js";
import { ROLES } from "../../common/constants.js";

const router = Router();

const profileDto = {
    validate(data = {}) {
        const payload = {};
        if (data.userName !== undefined) payload.userName = String(data.userName).trim().toLowerCase();
        if (data.avatar !== undefined) payload.avatar = String(data.avatar).trim();
        return payload;
    },
};

router.post("/register", validate(RegisterDto), controller.register);
router.post("/login", validate(LoginDto), controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", authenticate, controller.logout);
router.get("/me", authenticate, controller.getMe);
router.patch("/profile", authenticate, validate(profileDto), controller.updateProfile);
router.get("/admin-check", authenticate, authorize(ROLES.ADMIN), (req, res) => {
    res.status(200).json({ success: true, message: "Admin access granted" });
});

export default router;
