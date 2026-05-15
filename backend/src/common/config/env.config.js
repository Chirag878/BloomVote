import dotenv from "dotenv";

dotenv.config();

const required = (key) => {
    const value = process.env[key];
    if (!value) throw new Error(`Missing required environment variable: ${key}`);
    return value;
};

const env = {
    NODE_ENV:              process.env.NODE_ENV || "development",
    PORT:                  parseInt(process.env.PORT || "5000", 10),
    MONGODB_URI:           required("MONGODB_URI"),
    JWT_ACCESS_SECRET:     required("JWT_ACCESS_SECRET"),
    JWT_REFRESH_SECRET:    required("JWT_REFRESH_SECRET"),
    JWT_ACCESS_EXPIRES:    process.env.JWT_ACCESS_EXPIRES || process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    JWT_REFRESH_EXPIRES:   process.env.JWT_REFRESH_EXPIRES || process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    CLIENT_URL:            process.env.CLIENT_URL           || "http://localhost:5173",
    isDev:  () => env.NODE_ENV === "development",
    isProd: () => env.NODE_ENV === "production",
};

export default env;
