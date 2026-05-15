import Vote from "../../models/vote.model.js";
import Poll from "../../models/poll.model.js";
import ApiError from "../../common/utils/api-error.js";
import { getPagination, buildMeta } from "../../common/utils/pagination.js";

const assertPollCanReceiveVote = async (pollId, optionId) => {
    const poll = await Poll.findById(pollId);
    if (!poll) throw ApiError.notFound("Poll not found");

    if (!poll.isActive) throw ApiError.badRequest("Poll is not active");

    if (poll.expiresAt && poll.expiresAt < new Date()) {
        poll.isActive = false;
        await poll.save();
        throw ApiError.badRequest("Poll has expired");
    }

    const optionExists = poll.options.id(optionId);
    if (!optionExists) throw ApiError.badRequest("Option not found in the poll");

    return poll;
};

const castVote = async (userId, { pollId, optionId }) => {
    const poll = await assertPollCanReceiveVote(pollId, optionId);

    if (!poll.allowsMultipleVotes) {
        const existing = await Vote.findOne({ voter: userId, poll: pollId }).lean();
        if (existing) throw ApiError.conflict("You have already voted in this poll");
    }

    try {
        await Vote.create({ voter: userId, poll: pollId, optionId });
    } catch (error) {
        if (error.code === 11000) {
            throw ApiError.conflict("You have already selected this option");
        }
        throw error;
    }

    await Poll.updateOne(
        { _id: pollId, "options._id": optionId },
        { $inc: { "options.$.voteCount": 1, totalVotes: 1 } },
    );

    return Poll.findById(pollId)
        .populate("creator", "userName avatar")
        .lean();
};

const getUserVotes = async (voterId, pollId) => {
    return Vote.find({ voter: voterId, poll: pollId })
        .select("optionId createdAt")
        .sort({ createdAt: -1 })
        .lean();
};

const getUserVoteHistory = async (voterId, query = {}) => {
    const { page, limit, skip } = getPagination(query);

    const [votes, total] = await Promise.all([
        Vote.find({ voter: voterId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: "poll",
                select: "question options totalVotes isActive expiresAt creator category",
                populate: { path: "creator", select: "userName avatar" },
            })
            .lean(),
        Vote.countDocuments({ voter: voterId }),
    ]);

    return {
        data: votes,
        meta: buildMeta({ total, page, limit }),
    };
};

export { castVote, getUserVotes, getUserVoteHistory };
