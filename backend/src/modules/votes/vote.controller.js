import * as voteService from "./vote.service.js";
import ApiResponse from "../../common/utils/api-response.js";
import asyncHandler from "../../common/utils/async-handler.js";

const castVote = asyncHandler(async (req, res) => {
    const updatedPoll = await voteService.castVote(req.user.id, req.body);
    return ApiResponse.ok(res, "Vote cast successfully", updatedPoll);
});

const getMyVoteHistory = asyncHandler(async (req, res) => {
    const result = await voteService.getUserVoteHistory(req.user.id, req.query);
    return ApiResponse.paginated(res, "Vote history retrieved successfully", result.data, result.meta);
});

const getMyVoteOnPoll = asyncHandler(async (req, res) => {
    const vote = await voteService.getUserVotes(req.user.id, req.params.pollId);
    return ApiResponse.ok(res, "User vote retrieved successfully", vote);
});

export { castVote, getMyVoteHistory, getMyVoteOnPoll };
