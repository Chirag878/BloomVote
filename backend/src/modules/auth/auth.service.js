import User from "../../models/user.model.js";
import ApiError from "../../common/utils/api-error.js";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    hashToken,
} from "../../common/utils/jwt.utils.js";

const publicUser = (user) => {
    const raw = typeof user.toJSON === "function" ? user.toJSON() : user;
    return {
        _id: raw._id,
        userName: raw.userName,
        email: raw.email,
        role: raw.role,
        avatar: raw.avatar,
        isVerified: raw.isVerified,
        isActive: raw.isActive,
        pollsCreated: raw.pollsCreated,
        quizzesCreated: raw.quizzesCreated,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        lastLoginAt: raw.lastLoginAt,
    };
};

const buildTokenPayload = (user) => ({
    id: user._id.toString(),
    role: user.role,
});

const issueTokenPair = async (user) => {
    const payload = buildTokenPayload(user);
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshToken = hashToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

const register = async (payload) => {
    const existing = await User.findOne({
        $or: [{ email: payload.email }, { userName: payload.userName }],
    }).lean();

    if (existing) {
        throw ApiError.conflict("A user with that email or username already exists");
    }

    const user = await User.create(payload);
    const tokens = await issueTokenPair(user);

    return {
        user: publicUser(user),
        ...tokens,
    };
};

const login = async ({ email, password }) => {
    const user = await User.findOne({ email }).select("+password +refreshToken");
    if (!user) throw ApiError.unauthorized("Invalid email or password");
    if (user.isActive === false) throw ApiError.forbidden("User account is deactivated");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw ApiError.unauthorized("Invalid email or password");

    user.lastLoginAt = new Date();
    const tokens = await issueTokenPair(user);

    return {
        user: publicUser(user),
        ...tokens,
    };
};

const refresh = async (refreshToken) => {
    if (!refreshToken) throw ApiError.unauthorized("Refresh token is required");

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user) throw ApiError.unauthorized("Invalid refresh token");
    if (user.isActive === false) throw ApiError.forbidden("User account is deactivated");

    const incomingHash = hashToken(refreshToken);
    if (!user.refreshToken || user.refreshToken !== incomingHash) {
        user.refreshToken = undefined;
        await user.save({ validateBeforeSave: false });
        throw ApiError.unauthorized("Refresh token has been revoked");
    }

    const tokens = await issueTokenPair(user);
    return {
        user: publicUser(user),
        ...tokens,
    };
};

const logout = async (userId) => {
    if (!userId) return;
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: "" } });
};

const getMe = async (userId) => {
    const user = await User.findById(userId).lean();
    if (!user) throw ApiError.notFound("User not found");
    return publicUser(user);
};

const updateProfile = async (userId, payload) => {
    const update = {};
    if (payload.userName) update.userName = payload.userName;
    if (payload.avatar !== undefined) update.avatar = payload.avatar;

    const user = await User.findByIdAndUpdate(userId, update, {
        new: true,
        runValidators: true,
    }).lean();

    if (!user) throw ApiError.notFound("User not found");
    return publicUser(user);
};

export { register, login, refresh, logout, getMe, updateProfile };
