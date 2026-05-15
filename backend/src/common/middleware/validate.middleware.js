import asyncHandler from "../utils/async-handler.js";
import ApiError from "../utils/api-error.js";

const runValidator = (schema, value) => {
    if (!schema) return value;

    if (typeof schema.validate === "function") {
        return schema.validate(value);
    }

    if (typeof schema === "function") {
        return schema(value);
    }

    throw ApiError.internal("Invalid validator configuration");
};

const validate = (schema, source = "body") =>
    asyncHandler(async (req, res, next) => {
        try {
            req[source] = await runValidator(schema, req[source] ?? {});
            next();
        } catch (error) {
            if (error.statusCode) throw error;
            throw ApiError.badRequest(error.message || "Validation failed");
        }
    });

export default validate;
