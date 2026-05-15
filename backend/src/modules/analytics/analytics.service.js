import Poll from "../../models/poll.model.js";
import Vote from "../../models/vote.model.js";
import User from "../../models/user.model.js";
import Quiz from "../../models/quiz.model.js";
import QuizAttempt from "../../models/quizAttempt.model.js";

const sumPollVotes = async (filter = {}) => {
    const [result] = await Poll.aggregate([
        { $match: filter },
        { $group: { _id: null, totalVotes: { $sum: "$totalVotes" }, averageVotes: { $avg: "$totalVotes" } } },
        { $project: { _id: 0, totalVotes: 1, averageVotes: { $round: ["$averageVotes", 2] } } },
    ]);

    return result || { totalVotes: 0, averageVotes: 0 };
};

const getTrendingPolls = async (limit = 6) => {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return Vote.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$poll", recentVotes: { $sum: 1 }, lastVoteAt: { $max: "$createdAt" } } },
        { $sort: { recentVotes: -1, lastVoteAt: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: "polls",
                localField: "_id",
                foreignField: "_id",
                as: "poll",
            },
        },
        { $unwind: "$poll" },
        {
            $lookup: {
                from: "users",
                localField: "poll.creator",
                foreignField: "_id",
                as: "creator",
            },
        },
        { $unwind: { path: "$creator", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: "$poll._id",
                question: "$poll.question",
                category: "$poll.category",
                totalVotes: "$poll.totalVotes",
                isActive: "$poll.isActive",
                expiresAt: "$poll.expiresAt",
                recentVotes: 1,
                lastVoteAt: 1,
                creator: {
                    _id: "$creator._id",
                    userName: "$creator.userName",
                    avatar: "$creator.avatar",
                },
            },
        },
    ]);
};

const getMostVotedPolls = (limit = 6) =>
    Poll.find({})
        .sort({ totalVotes: -1, createdAt: -1 })
        .limit(limit)
        .populate("creator", "userName avatar")
        .lean();

const getRecentActivity = async () => {
    const [polls, votes, quizzes, attempts] = await Promise.all([
        Poll.find({})
            .sort({ createdAt: -1 })
            .limit(6)
            .populate("creator", "userName avatar")
            .lean(),
        Vote.find({})
            .sort({ createdAt: -1 })
            .limit(6)
            .populate("voter", "userName avatar")
            .populate("poll", "question")
            .lean(),
        Quiz.find({})
            .sort({ createdAt: -1 })
            .limit(6)
            .populate("creator", "userName avatar")
            .lean(),
        QuizAttempt.find({})
            .sort({ createdAt: -1 })
            .limit(6)
            .populate("user", "userName avatar")
            .populate("quiz", "title")
            .lean(),
    ]);

    return [
        ...polls.map((poll) => ({
            type: "poll_created",
            title: poll.question,
            actor: poll.creator,
            resourceId: poll._id,
            createdAt: poll.createdAt,
        })),
        ...votes.map((vote) => ({
            type: "vote_cast",
            title: vote.poll?.question || "Poll vote",
            actor: vote.voter,
            resourceId: vote.poll?._id,
            createdAt: vote.createdAt,
        })),
        ...quizzes.map((quiz) => ({
            type: "quiz_created",
            title: quiz.title,
            actor: quiz.creator,
            resourceId: quiz._id,
            createdAt: quiz.createdAt,
        })),
        ...attempts.map((attempt) => ({
            type: "quiz_attempt",
            title: attempt.quiz?.title || "Quiz attempt",
            actor: attempt.user,
            resourceId: attempt.quiz?._id,
            createdAt: attempt.createdAt,
        })),
    ]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 12);
};

const getQuizSummary = async () => {
    const [attemptSummary] = await QuizAttempt.aggregate([
        {
            $group: {
                _id: null,
                totalAttempts: { $sum: 1 },
                averageScore: { $avg: "$score" },
                passedAttempts: { $sum: { $cond: ["$passed", 1, 0] } },
            },
        },
        {
            $project: {
                _id: 0,
                totalAttempts: 1,
                averageScore: { $round: ["$averageScore", 2] },
                passedAttempts: 1,
                passRate: {
                    $cond: [
                        { $eq: ["$totalAttempts", 0] },
                        0,
                        { $round: [{ $multiply: [{ $divide: ["$passedAttempts", "$totalAttempts"] }, 100] }, 2] },
                    ],
                },
            },
        },
    ]);

    const [totalQuizzes, publishedQuizzes] = await Promise.all([
        Quiz.countDocuments(),
        Quiz.countDocuments({ isPublished: true }),
    ]);

    return {
        totalQuizzes,
        publishedQuizzes,
        totalAttempts: attemptSummary?.totalAttempts || 0,
        averageScore: attemptSummary?.averageScore || 0,
        passedAttempts: attemptSummary?.passedAttempts || 0,
        passRate: attemptSummary?.passRate || 0,
    };
};

const getUserAnalytics = async () => {
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const [totalUsers, activeUsers, signups, topCreators] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.aggregate([
            { $match: { createdAt: { $gte: since } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    users: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", users: 1 } },
        ]),
        Poll.aggregate([
            {
                $group: {
                    _id: "$creator",
                    pollsCreated: { $sum: 1 },
                    totalVotes: { $sum: "$totalVotes" },
                },
            },
            { $sort: { totalVotes: -1, pollsCreated: -1 } },
            { $limit: 8 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
            {
                $project: {
                    _id: "$user._id",
                    userName: "$user.userName",
                    avatar: "$user.avatar",
                    pollsCreated: 1,
                    totalVotes: 1,
                },
            },
        ]),
    ]);

    return { totalUsers, activeUsers, signups, topCreators };
};

const getDashboard = async (requester) => {
    const now = new Date();

    const [
        totalPolls,
        activePolls,
        voteSummary,
        totalUsers,
        quizSummary,
        trendingPolls,
        mostVotedPolls,
        recentActivity,
        myPolls,
        myVotes,
        myQuizzes,
        myAttempts,
    ] = await Promise.all([
        Poll.countDocuments(),
        Poll.countDocuments({ isActive: true, expiresAt: { $gt: now } }),
        sumPollVotes(),
        User.countDocuments(),
        getQuizSummary(),
        getTrendingPolls(6),
        getMostVotedPolls(6),
        getRecentActivity(),
        Poll.countDocuments({ creator: requester.id }),
        Vote.countDocuments({ voter: requester.id }),
        Quiz.countDocuments({ creator: requester.id }),
        QuizAttempt.countDocuments({ user: requester.id }),
    ]);

    return {
        totals: {
            totalPolls,
            activePolls,
            totalVotes: voteSummary.totalVotes,
            totalUsers,
            ...quizSummary,
        },
        engagement: {
            averageVotesPerPoll: voteSummary.averageVotes || 0,
            activePollRate: totalPolls ? Number(((activePolls / totalPolls) * 100).toFixed(2)) : 0,
            quizAttemptRate: quizSummary.totalQuizzes
                ? Number((quizSummary.totalAttempts / quizSummary.totalQuizzes).toFixed(2))
                : 0,
        },
        mine: {
            polls: myPolls,
            votes: myVotes,
            quizzes: myQuizzes,
            attempts: myAttempts,
        },
        trendingPolls,
        mostVotedPolls,
        recentActivity,
    };
};

const getPollAnalytics = async () => {
    const [totalPolls, activePolls, voteSummary, trendingPolls, mostVotedPolls] = await Promise.all([
        Poll.countDocuments(),
        Poll.countDocuments({ isActive: true, expiresAt: { $gt: new Date() } }),
        sumPollVotes(),
        getTrendingPolls(10),
        getMostVotedPolls(10),
    ]);

    return {
        totalPolls,
        activePolls,
        totalVotes: voteSummary.totalVotes,
        averageVotesPerPoll: voteSummary.averageVotes,
        trendingPolls,
        mostVotedPolls,
    };
};

export {
    getDashboard,
    getTrendingPolls,
    getMostVotedPolls,
    getRecentActivity,
    getQuizSummary,
    getUserAnalytics,
    getPollAnalytics,
};
