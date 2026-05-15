import * as analyticsService from "./analytics.service.js";
import ApiResponse from "../../common/utils/api-response.js";
import asyncHandler from "../../common/utils/async-handler.js";

const dashboard = asyncHandler(async (req, res) => {
    const data = await analyticsService.getDashboard(req.user);
    return ApiResponse.ok(res, "Dashboard analytics retrieved successfully", data);
});

const pollAnalytics = asyncHandler(async (req, res) => {
    const data = await analyticsService.getPollAnalytics();
    return ApiResponse.ok(res, "Poll analytics retrieved successfully", data);
});

const trendingPolls = asyncHandler(async (req, res) => {
    const data = await analyticsService.getTrendingPolls(Number(req.query.limit) || 10);
    return ApiResponse.ok(res, "Trending polls retrieved successfully", data);
});

const quizAnalytics = asyncHandler(async (req, res) => {
    const data = await analyticsService.getQuizSummary();
    return ApiResponse.ok(res, "Quiz analytics retrieved successfully", data);
});

const userAnalytics = asyncHandler(async (req, res) => {
    const data = await analyticsService.getUserAnalytics();
    return ApiResponse.ok(res, "User analytics retrieved successfully", data);
});

const recentActivity = asyncHandler(async (req, res) => {
    const data = await analyticsService.getRecentActivity();
    return ApiResponse.ok(res, "Recent activity retrieved successfully", data);
});

export { dashboard, pollAnalytics, trendingPolls, quizAnalytics, userAnalytics, recentActivity };
