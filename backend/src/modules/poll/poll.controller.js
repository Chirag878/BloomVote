import * as pollService from "./poll.service.js";
import ApiResponse from "../../common/utils/api-response.js";
import asyncHandler from "../../common/utils/async-handler.js";

const createPoll = asyncHandler(async (req, res) => {
    const poll = await pollService.createPoll(req.user.id, req.body);
    return ApiResponse.created(res, "Poll created successfully", poll);
});

const getPolls = asyncHandler(async (req, res) => {
    const result = await pollService.getPolls(req.query);
    return ApiResponse.paginated(res, "Polls retrieved successfully", result.data, result.meta);
});

const getPollById = asyncHandler(async (req, res) => {
    const poll = await pollService.getPollById(req.params.pollId);
    return ApiResponse.ok(res, "Poll retrieved successfully", poll);
});

const updatePoll = asyncHandler(async (req, res) => {
    const poll = await pollService.updatePoll(req.params.pollId, req.user, req.body);
    return ApiResponse.ok(res, "Poll updated successfully", poll);
});

const deletePoll = asyncHandler(async (req, res) => {
    await pollService.deletePoll(req.params.pollId, req.user);
    return ApiResponse.ok(res, "Poll deleted successfully");
});

const getPollAnalytics = asyncHandler(async (req, res) => {
    const analytics = await pollService.getPollAnalytics(req.params.pollId, req.user);
    return ApiResponse.ok(res, "Poll analytics retrieved successfully", analytics);
});

export { createPoll, getPolls, getPollById, updatePoll, deletePoll, getPollAnalytics };
