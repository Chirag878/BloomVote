import env from "./config/env.config.js";

export const ROLES = Object.freeze({
    USER:  "user",
    ADMIN: "admin",
});

export const POLL_CATEGORIES = Object.freeze([
    "General",
    "Technology",
    "Entertainment",
    "Sports",
    "Politics",
    "Health",
    "Education",
    "Other",
]);

export const QUIZ_CATEGORIES = Object.freeze([
    "General",
    "Technology",
    "Entertainment",
    "Sports",
    "Politics",
    "Health",
    "Education",
    "Other",
]);

export const COOKIE_NAMES = Object.freeze({
    REFRESH_TOKEN: "refreshToken",
});

export const COOKIE_OPTIONS = Object.freeze({
    httpOnly: true,
    secure:   env.isProd(),
    sameSite: env.isProd() ? "none" : "lax",
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in ms
});
