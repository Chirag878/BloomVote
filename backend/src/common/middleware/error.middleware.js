import mongoose from "mongoose";
import ApiError from "../utils/api-error.js";
import env from "../config/env.config.js";

const notFound = (req, res, next) => {
    next(ApiError.notFound(`Route not found: ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
    let error = err;

    if (err instanceof mongoose.Error.CastError) {
        error = ApiError.badRequest("Invalid resource identifier");
    }

    if (err instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(err.errors).map((item) => item.message);
        error = ApiError.badRequest("Validation failed", errors);
    }

    if (err?.code === 11000) {
        const fields = Object.keys(err.keyPattern || {}).join(", ");
        error = ApiError.conflict(`${fields || "Resource"} already exists`);
    }

    const statusCode = error.statusCode || 500;
    const payload = {
        success: false,
        message: error.message || "Internal server error",
    };

    if (error.errors?.length) payload.errors = error.errors;
    if (env.isDev() && error.stack) payload.stack = error.stack;

    return res.status(statusCode).json(payload);
};

export { errorHandler, notFound };
