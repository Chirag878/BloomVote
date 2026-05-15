import crypto from 'crypto';
import jwt from 'jsonwebtoken'; 
import env from "../config/env.config.js";
import ApiError from "./api-error.js";

const generateAccessToken = (payload) =>{
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES });
};

const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, env.JWT_ACCESS_SECRET);
    }
    catch(err){
        throw ApiError.unauthorized("Invalid or expired access token");
    }
};

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES });
};

const verifyRefreshToken = (token) => {
    try{
        return jwt.verify(token, env.JWT_REFRESH_SECRET);
    }
    catch(err){
        throw ApiError.unauthorized("Invalid or expired refresh token");
    }
};

const generateResetToken = () => {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
    return { rawToken, hashedToken };
};

const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

export {
    generateAccessToken,
    verifyAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    generateResetToken,
    hashToken,
};
