import validator from "validator";
import ApiError from "../utils/api-error.js";

const toTrimmedString = (value) => (typeof value === "string" ? value.trim() : value);

class BaseDto {
    static fail(message) {
        throw ApiError.badRequest(message);
    }

    static string(value, field, { min = 1, max = 1000, required = true } = {}) {
        const cleaned = toTrimmedString(value);
        if (!cleaned) {
            if (required) this.fail(`${field} is required`);
            return undefined;
        }
        if (typeof cleaned !== "string") this.fail(`${field} must be a string`);
        if (cleaned.length < min) this.fail(`${field} must be at least ${min} characters`);
        if (cleaned.length > max) this.fail(`${field} cannot exceed ${max} characters`);
        return cleaned;
    }

    static email(value) {
        const email = this.string(value, "email", { max: 322 }).toLowerCase();
        if (!validator.isEmail(email)) this.fail("Please provide a valid email");
        return email;
    }

    static boolean(value, fallback = false) {
        if (value === undefined || value === null || value === "") return fallback;
        if (typeof value === "boolean") return value;
        if (value === "true") return true;
        if (value === "false") return false;
        return Boolean(value);
    }

    static number(value, field, { min = 0, max = Number.MAX_SAFE_INTEGER, fallback } = {}) {
        if (value === undefined || value === null || value === "") return fallback;
        const number = Number(value);
        if (!Number.isFinite(number)) this.fail(`${field} must be a number`);
        if (number < min) this.fail(`${field} must be at least ${min}`);
        if (number > max) this.fail(`${field} cannot exceed ${max}`);
        return number;
    }

    static enum(value, field, allowed, fallback) {
        const cleaned = value ?? fallback;
        if (!allowed.includes(cleaned)) this.fail(`${field} must be one of: ${allowed.join(", ")}`);
        return cleaned;
    }

    static objectId(value, field) {
        const cleaned = this.string(value, field, { min: 24, max: 24 });
        if (!validator.isMongoId(cleaned)) this.fail(`${field} must be a valid MongoDB ObjectId`);
        return cleaned;
    }

    static date(value, field, { required = false } = {}) {
        if (!value) {
            if (required) this.fail(`${field} is required`);
            return undefined;
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) this.fail(`${field} must be a valid date`);
        return date;
    }

    static validate(data) {
        return data ?? {};
    }
}

export default BaseDto;
