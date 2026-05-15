import asyncHandler from "../utils/async-handler.js";
import ApiError from "../utils/api-error.js";
import { verifyAccessToken } from "../utils/jwt.utils.js";
import User from "../../models/user.model.js";

const readBearerToken = (req) => {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) return header.split(" ")[1];
    return req.cookies?.accessToken || null;
};

const authenticate = asyncHandler(async (req, res, next) => {
    const token = readBearerToken(req);
    if (!token) throw ApiError.unauthorized("Authentication required");

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id)
        .select("_id email userName role avatar isActive")
        .lean();

    if (!user) throw ApiError.unauthorized("User not found");
    if (user.isActive === false) throw ApiError.forbidden("User account is deactivated");

    req.user = {
        id: user._id.toString(),
        _id: user._id,
        email: user.email,
        userName: user.userName,
        role: user.role,
        avatar: user.avatar,
    };

    next();
});

const authorize = (...roles) => (req, res, next) => {
    if (!req.user) throw ApiError.unauthorized("Authentication required");
    if (!roles.includes(req.user.role)) {
        throw ApiError.forbidden(`Access restricted to ${roles.join(", ")}`);
    }
    next();
};

export { authenticate, authorize };
