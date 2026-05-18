import * as quizService from "./quiz.service.js";
import ApiError from "../../common/utils/api-error.js";
import ApiResponse from "../../common/utils/api-response.js";
import asyncHandler from "../../common/utils/async-handler.js";

const createQuiz = asyncHandler(async (req, res) => {
    const quiz = await quizService.createQuiz(req.user.id, req.body);
    return ApiResponse.created(res, "Quiz created successfully", quiz);
});

const getQuizzes = asyncHandler(async (req, res) => {
    const result = await quizService.getQuizzes(req.query, req.user);
    return ApiResponse.paginated(res, "Quizzes retrieved successfully", result.data, result.meta);
});

const getMyQuizzes = asyncHandler(async (req, res) => {
    const result = await quizService.getQuizzes({ ...req.query, mine: "true" }, req.user);
    return ApiResponse.paginated(res, "My quizzes retrieved successfully", result.data, result.meta);
});

const getQuizById = asyncHandler(async (req, res) => {
    const quiz = await quizService.getQuizById(req.params.quizId, req.user || null);
    return ApiResponse.ok(res, "Quiz retrieved successfully", quiz);
});

const getQuizByShareSlug = asyncHandler(async (req, res) => {
    const quiz = await quizService.getQuizByShareSlug(req.params.shareSlug);
    return ApiResponse.ok(res, "Shared quiz retrieved successfully", quiz);
});

const updateQuiz = asyncHandler(async (req, res) => {
    const quiz = await quizService.updateQuiz(req.params.quizId, req.user, req.body);
    return ApiResponse.ok(res, "Quiz updated successfully", quiz);
});

const deleteQuiz = asyncHandler(async (req, res) => {
    await quizService.deleteQuiz(req.params.quizId, req.user);
    return ApiResponse.ok(res, "Quiz deleted successfully");
});

const addQuestion = asyncHandler(async (req, res) => {
    const question = await quizService.addQuestion(req.params.quizId, req.user, req.body);
    return ApiResponse.created(res, "Question added successfully", question);
});

const getQuestions = asyncHandler(async (req, res) => {
    const questions = await quizService.getQuestions(req.params.quizId, req.user);
    return ApiResponse.ok(res, "Questions retrieved successfully", questions);
});

const publishQuiz = asyncHandler(async (req, res) => {
    const quiz = await quizService.publishQuiz(req.params.quizId, req.user);
    return ApiResponse.ok(res, "Quiz published successfully", quiz);
});

const submitAttempt = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized("Authentication required");
    const result = await quizService.submitAttempt(req.params.quizId, userId, req.body);
    return ApiResponse.created(res, "Quiz attempt submitted successfully", result);
});

const getMyAttempts = asyncHandler(async (req, res) => {
    const result = await quizService.getMyAttempts(req.user.id, req.query);
    return ApiResponse.paginated(res, "Quiz attempts retrieved successfully", result.data, result.meta);
});

const getQuizAnalytics = asyncHandler(async (req, res) => {
    const analytics = await quizService.getQuizAnalytics(req.params.quizId, req.user);
    return ApiResponse.ok(res, "Quiz analytics retrieved successfully", analytics);
});

export {
    createQuiz,
    getQuizzes,
    getMyQuizzes,
    getQuizById,
    getQuizByShareSlug,
    updateQuiz,
    deleteQuiz,
    addQuestion,
    getQuestions,
    publishQuiz,
    submitAttempt,
    getMyAttempts,
    getQuizAnalytics,
};
