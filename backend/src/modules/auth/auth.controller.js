import * as authService from "./auth.service.js";
import ApiResponse from "../../common/utils/api-response.js";
import asyncHandler from "../../common/utils/async-handler.js";
import { COOKIE_NAMES, COOKIE_OPTIONS } from "../../common/constants.js";

const setRefreshCookie = (res, refreshToken) => {
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, COOKIE_OPTIONS);
};

const clearRefreshCookie = (res) => {
    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, {
        httpOnly: COOKIE_OPTIONS.httpOnly,
        secure: COOKIE_OPTIONS.secure,
        sameSite: COOKIE_OPTIONS.sameSite,
    });
};

const register = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.register(req.body);
    setRefreshCookie(res, refreshToken);
    return ApiResponse.created(res, "User registered successfully", { user, accessToken });
});

const login = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    setRefreshCookie(res, refreshToken);
    return ApiResponse.ok(res, "Login successful", { user, accessToken });
});

const refresh = asyncHandler(async (req, res) => {
    const token = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN] || req.body?.refreshToken;
    const { user, accessToken, refreshToken } = await authService.refresh(token);
    setRefreshCookie(res, refreshToken);
    return ApiResponse.ok(res, "Token refreshed successfully", { user, accessToken });
});

const logout = asyncHandler(async (req, res) => {
    await authService.logout(req.user?.id);
    clearRefreshCookie(res);
    return ApiResponse.ok(res, "Logout successful");
});

const getMe = asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user.id);
    return ApiResponse.ok(res, "User profile retrieved successfully", user);
});

const updateProfile = asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(req.user.id, req.body);
    return ApiResponse.ok(res, "Profile updated successfully", user);
});

export { register, login, refresh, logout, getMe, updateProfile };
