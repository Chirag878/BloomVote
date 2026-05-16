import mongoose from "mongoose";
import crypto from "crypto";
import Poll from "../../models/poll.model.js";
import Vote from "../../models/vote.model.js";
import User from "../../models/user.model.js";
import ApiError from "../../common/utils/api-error.js";
import { getPagination, buildMeta } from "../../common/utils/pagination.js";
import { ROLES } from "../../common/constants.js";

const isOwnerOrAdmin = (resource, requester) => {
    if (!requester) return false;
    const creatorId = resource.creator?._id || resource.creator;
    return creatorId?.toString() === requester.id?.toString() || requester.role === ROLES.ADMIN;
};

const normalizePollState = async (poll) => {
    if (!poll) return null;
    const expired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
    if (expired && poll.isActive) {
        await Poll.findByIdAndUpdate(poll._id, { isActive: false });
        poll.isActive = false;
    }
    return poll;
};

const decorateOptionStats = (poll) => ({
    ...poll,
    options: poll.options.map((option) => ({
        ...option,
        percentage: poll.totalVotes > 0 ? Number(((option.voteCount / poll.totalVotes) * 100).toFixed(2)) : 0,
    })),
});

const createPoll = async (creatorId, payload) => {
    const poll = await Poll.create({
        ...payload,
        creator: creatorId,
        shareSlug: crypto.randomUUID(),
    });

    await User.findByIdAndUpdate(creatorId, { $inc: { pollsCreated: 1 } });

    return Poll.findById(poll._id)
        .populate("creator", "userName avatar")
        .lean();
};

const getPolls = async (query = {}) => {
    const { page, limit, skip } = getPagination(query);
    const filter = {};
    filter.visibility = "public";

    if (query.category) filter.category = query.category;
    if (query.creator) filter.creator = query.creator;
    if (query.isActive !== undefined) filter.isActive = query.isActive === "true" || query.isActive === true;
    if (query.search) filter.question = { $regex: query.search, $options: "i" };

    const sortMap = {
        popular: { totalVotes: -1, createdAt: -1 },
        endingSoon: { expiresAt: 1 },
        oldest: { createdAt: 1 },
        newest: { createdAt: -1 },
    };

    const sort = sortMap[query.sort] || sortMap.newest;

    const [polls, total] = await Promise.all([
        Poll.find(filter)
            .populate("creator", "userName avatar")
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Poll.countDocuments(filter),
    ]);

    return {
        data: polls.map(decorateOptionStats),
        meta: buildMeta({ total, page, limit }),
    };
};

const getPollById = async (pollId) => {
    const poll = await Poll.findById(pollId)
        .populate("creator", "userName avatar")
        .lean();

    if (!poll) throw ApiError.notFound("Poll not found");
    await normalizePollState(poll);
    return decorateOptionStats(poll);
};

const getPollByShareSlug = async (shareSlug) => {
    const poll = await Poll.findOne({ shareSlug, visibility: "public" })
        .populate("creator", "userName avatar")
        .lean();
    if (!poll) throw ApiError.notFound("Shared poll not found");
    await normalizePollState(poll);
    return decorateOptionStats(poll);
};

const updatePoll = async (pollId, requester, payload) => {
    const poll = await Poll.findById(pollId);
    if (!poll) throw ApiError.notFound("Poll not found");
    if (!isOwnerOrAdmin(poll, requester)) throw ApiError.forbidden("You are not allowed to update this poll");

    if (payload.options && poll.totalVotes > 0) {
        throw ApiError.badRequest("Poll options cannot be changed after votes have been cast");
    }

    Object.assign(poll, payload);
    await poll.save();

    return Poll.findById(poll._id)
        .populate("creator", "userName avatar")
        .lean();
};

const deletePoll = async (pollId, requester) => {
    const poll = await Poll.findById(pollId);
    if (!poll) throw ApiError.notFound("Poll not found");
    if (!isOwnerOrAdmin(poll, requester)) throw ApiError.forbidden("You are not allowed to delete this poll");

    await Promise.all([
        Vote.deleteMany({ poll: poll._id }),
        Poll.deleteOne({ _id: poll._id }),
        User.findByIdAndUpdate(poll.creator, { $inc: { pollsCreated: -1 } }),
    ]);
};

const getPollAnalytics = async (pollId, requester) => {
    const poll = await Poll.findById(pollId)
        .populate("creator", "userName avatar")
        .lean();

    if (!poll) throw ApiError.notFound("Poll not found");
    if (!isOwnerOrAdmin(poll, requester)) {
        throw ApiError.forbidden("You are not authorized to view analytics for this poll");
    }

    const objectId = new mongoose.Types.ObjectId(pollId);
    const options = [...poll.options]
        .sort((a, b) => b.voteCount - a.voteCount)
        .map((option, index) => ({
            _id: option._id,
            text: option.text,
            voteCount: option.voteCount,
            percentage: poll.totalVotes > 0 ? Number(((option.voteCount / poll.totalVotes) * 100).toFixed(2)) : 0,
            rank: index + 1,
            isLeading: index === 0 && option.voteCount > 0,
        }));

    const [votingTrends, hourlyTrends, uniqueVoters] = await Promise.all([
        Vote.aggregate([
            { $match: { poll: objectId } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    votes: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", votes: 1 } },
        ]),
        Vote.aggregate([
            { $match: { poll: objectId } },
            { $group: { _id: { $hour: "$createdAt" }, votes: { $sum: 1 } } },
            { $sort: { votes: -1 } },
            { $limit: 1 },
            { $project: { _id: 0, hour: "$_id", votes: 1 } },
        ]),
        Vote.distinct("voter", { poll: objectId }),
    ]);

    const peakHour = hourlyTrends[0]
        ? {
            hour: hourlyTrends[0].hour,
            label: formatHour(hourlyTrends[0].hour),
            votes: hourlyTrends[0].votes,
        }
        : null;

    const now = new Date();
    const ageInHours = Math.max(Math.floor((now - new Date(poll.createdAt)) / (1000 * 60 * 60)), 1);

    return {
        poll: {
            _id: poll._id,
            question: poll.question,
            creator: poll.creator,
            category: poll.category,
        },
        summary: {
            totalVotes: poll.totalVotes,
            uniqueVoters: uniqueVoters.length,
            isActive: poll.isActive && (!poll.expiresAt || poll.expiresAt > now),
            category: poll.category,
            createdAt: poll.createdAt,
            expiresAt: poll.expiresAt,
            ageInHours,
            isExpired: poll.expiresAt ? poll.expiresAt < now : false,
            votesPerHour: Number((poll.totalVotes / ageInHours).toFixed(2)),
            leadingOption: options.length > 0 ? options[0].text : null,
            isTie: options.length > 1 && options[0].voteCount > 0 && options[0].voteCount === options[1].voteCount,
        },
        options,
        votingTrends,
        peakHour,
    };
};

const formatHour = (hour) => {
    if (hour === 0) return "12 AM";
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return "12 PM";
    return `${hour - 12} PM`;
};

export { createPoll, getPolls, getPollById, getPollByShareSlug, updatePoll, getPollAnalytics, deletePoll };
