import mongoose from "mongoose";
import Quiz from "../../models/quiz.model.js";
import Question from "../../models/question.model.js";
import QuizAttempt from "../../models/quizAttempt.model.js";
import User from "../../models/user.model.js";
import ApiError from "../../common/utils/api-error.js";
import { ROLES } from "../../common/constants.js";
import { getPagination, buildMeta } from "../../common/utils/pagination.js";

const isOwnerOrAdmin = (resource, requester) => {
    const creatorId = resource.creator?._id || resource.creator;
    return creatorId?.toString() === requester.id?.toString() || requester.role === ROLES.ADMIN;
};

const assertQuizAccess = async (quizId, requester, ownerOnly = false) => {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw ApiError.notFound("Quiz not found");

    const canManage = isOwnerOrAdmin(quiz, requester);
    if (ownerOnly && !canManage) throw ApiError.forbidden("You are not allowed to manage this quiz");
    if (!ownerOnly && !quiz.isPublished && !canManage) throw ApiError.forbidden("This quiz is not published");

    return quiz;
};

const sanitizeQuestions = (questions, includeAnswers = false) => {
    if (includeAnswers) return questions;

    return questions.map((question) => ({
        ...question,
        options: question.options.map((option) => ({
            _id: option._id,
            text: option.text,
        })),
        explanation: undefined,
    }));
};

const createQuiz = async (creatorId, payload) => {
    const quiz = await Quiz.create({ ...payload, creator: creatorId });
    await User.findByIdAndUpdate(creatorId, { $inc: { quizzesCreated: 1 } });

    return Quiz.findById(quiz._id)
        .populate("creator", "userName avatar")
        .lean();
};

const getQuizzes = async (query = {}, requester = null) => {
    const { page, limit, skip } = getPagination(query);
    const filter = {};

    if (query.mine === "true" && requester) filter.creator = requester.id;
    if (!filter.creator) filter.isPublished = true;
    if (query.category) filter.category = query.category;
    if (query.search) {
        filter.$or = [
            { title: { $regex: query.search, $options: "i" } },
            { description: { $regex: query.search, $options: "i" } },
        ];
    }
    if (query.isPublished !== undefined && filter.creator) {
        filter.isPublished = query.isPublished === "true" || query.isPublished === true;
    }

    const [quizzes, total] = await Promise.all([
        Quiz.find(filter)
            .populate("creator", "userName avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Quiz.countDocuments(filter),
    ]);

    return {
        data: quizzes,
        meta: buildMeta({ total, page, limit }),
    };
};

const getQuizById = async (quizId, requester) => {
    const quiz = await Quiz.findById(quizId)
        .populate("creator", "userName avatar")
        .lean();

    if (!quiz) throw ApiError.notFound("Quiz not found");
    const canManage = isOwnerOrAdmin(quiz, requester);
    if (!quiz.isPublished && !canManage) throw ApiError.forbidden("This quiz is not published");

    return quiz;
};

const updateQuiz = async (quizId, requester, payload) => {
    await assertQuizAccess(quizId, requester, true);

    const quiz = await Quiz.findByIdAndUpdate(quizId, payload, {
        new: true,
        runValidators: true,
    })
        .populate("creator", "userName avatar")
        .lean();

    return quiz;
};

const deleteQuiz = async (quizId, requester) => {
    const quiz = await assertQuizAccess(quizId, requester, true);

    await Promise.all([
        Quiz.deleteOne({ _id: quiz._id }),
        Question.deleteMany({ quiz: quiz._id }),
        QuizAttempt.deleteMany({ quiz: quiz._id }),
        User.findByIdAndUpdate(quiz.creator, { $inc: { quizzesCreated: -1 } }),
    ]);
};

const addQuestion = async (quizId, requester, payload) => {
    const quiz = await assertQuizAccess(quizId, requester, true);

    const question = await Question.create({
        ...payload,
        quiz: quiz._id,
    });

    await Quiz.findByIdAndUpdate(quiz._id, { $inc: { totalQuestions: 1 } });
    return question.toJSON();
};

const getQuestions = async (quizId, requester) => {
    const quiz = await assertQuizAccess(quizId, requester, false);
    const includeAnswers = isOwnerOrAdmin(quiz, requester);

    const questions = await Question.find({ quiz: quiz._id })
        .sort({ order: 1 })
        .lean();

    return sanitizeQuestions(questions, includeAnswers);
};

const publishQuiz = async (quizId, requester) => {
    const quiz = await assertQuizAccess(quizId, requester, true);
    const questionCount = await Question.countDocuments({ quiz: quiz._id });

    if (questionCount === 0) throw ApiError.badRequest("Add at least one question before publishing");

    quiz.isPublished = true;
    quiz.totalQuestions = questionCount;
    await quiz.save();

    return quiz.toJSON();
};

const submitAttempt = async (quizId, userId, payload) => {
    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz) throw ApiError.notFound("Quiz not found");
    if (!quiz.isPublished) throw ApiError.badRequest("Quiz is not published");

    const questions = await Question.find({ quiz: quizId }).sort({ order: 1 }).lean();
    if (!questions.length) throw ApiError.badRequest("Quiz has no questions");

    const answerMap = new Map(payload.answers.map((answer) => [answer.question.toString(), answer]));
    let score = 0;
    let totalPoints = 0;

    const answers = questions.map((question) => {
        totalPoints += question.points;
        const submitted = answerMap.get(question._id.toString());
        const selectedOptionId = submitted?.selectedOption?.toString();
        const selectedOption = question.options.find((option) => option._id.toString() === selectedOptionId);
        const isCorrect = Boolean(selectedOption?.isCorrect);

        if (isCorrect) score += question.points;

        return {
            question: question._id,
            selectedOption: selectedOption?._id,
            isCorrect,
            timeTaken: submitted?.timeTaken || 0,
        };
    });

    const percentage = totalPoints > 0 ? Number(((score / totalPoints) * 100).toFixed(2)) : 0;
    const attempt = await QuizAttempt.create({
        user: userId,
        quiz: quizId,
        answers,
        score,
        passed: percentage >= 60,
        completedAt: new Date(),
    });

    await Quiz.findByIdAndUpdate(quizId, { $inc: { totalAttempts: 1 } });

    return {
        attempt: attempt.toJSON(),
        score,
        totalPoints,
        percentage,
        passed: percentage >= 60,
        correctAnswers: answers.filter((answer) => answer.isCorrect).length,
        totalQuestions: questions.length,
    };
};

const getMyAttempts = async (userId, query = {}) => {
    const { page, limit, skip } = getPagination(query);

    const [attempts, total] = await Promise.all([
        QuizAttempt.find({ user: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("quiz", "title category totalQuestions timeLimit")
            .lean(),
        QuizAttempt.countDocuments({ user: userId }),
    ]);

    return {
        data: attempts,
        meta: buildMeta({ total, page, limit }),
    };
};

const getQuizAnalytics = async (quizId, requester) => {
    const quiz = await assertQuizAccess(quizId, requester, true);
    const objectId = new mongoose.Types.ObjectId(quizId);

    const [summary] = await QuizAttempt.aggregate([
        { $match: { quiz: objectId } },
        { $addFields: { totalTimeTaken: { $sum: "$answers.timeTaken" } } },
        {
            $group: {
                _id: "$quiz",
                attempts: { $sum: 1 },
                averageScore: { $avg: "$score" },
                passes: { $sum: { $cond: ["$passed", 1, 0] } },
                averageTime: { $avg: "$totalTimeTaken" },
            },
        },
        {
            $project: {
                _id: 0,
                attempts: 1,
                averageScore: { $round: ["$averageScore", 2] },
                passes: 1,
                passRate: {
                    $cond: [
                        { $eq: ["$attempts", 0] },
                        0,
                        { $round: [{ $multiply: [{ $divide: ["$passes", "$attempts"] }, 100] }, 2] },
                    ],
                },
                averageTime: { $round: ["$averageTime", 2] },
            },
        },
    ]);

    const [dailyAttempts, questionPerformance, recentAttempts] = await Promise.all([
        QuizAttempt.aggregate([
            { $match: { quiz: objectId } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    attempts: { $sum: 1 },
                    averageScore: { $avg: "$score" },
                },
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", attempts: 1, averageScore: { $round: ["$averageScore", 2] } } },
        ]),
        QuizAttempt.aggregate([
            { $match: { quiz: objectId } },
            { $unwind: "$answers" },
            {
                $group: {
                    _id: "$answers.question",
                    attempts: { $sum: 1 },
                    correct: { $sum: { $cond: ["$answers.isCorrect", 1, 0] } },
                },
            },
            {
                $project: {
                    question: "$_id",
                    _id: 0,
                    attempts: 1,
                    correct: 1,
                    accuracy: {
                        $cond: [
                            { $eq: ["$attempts", 0] },
                            0,
                            { $round: [{ $multiply: [{ $divide: ["$correct", "$attempts"] }, 100] }, 2] },
                        ],
                    },
                },
            },
        ]),
        QuizAttempt.find({ quiz: objectId })
            .sort({ createdAt: -1 })
            .limit(8)
            .populate("user", "userName avatar")
            .lean(),
    ]);

    return {
        quiz: {
            _id: quiz._id,
            title: quiz.title,
            totalQuestions: quiz.totalQuestions,
            totalAttempts: quiz.totalAttempts,
            isPublished: quiz.isPublished,
        },
        summary: summary || {
            attempts: 0,
            averageScore: 0,
            passes: 0,
            passRate: 0,
            averageTime: 0,
        },
        dailyAttempts,
        questionPerformance,
        recentAttempts,
    };
};

export {
    createQuiz,
    getQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    addQuestion,
    getQuestions,
    publishQuiz,
    submitAttempt,
    getMyAttempts,
    getQuizAnalytics,
};
