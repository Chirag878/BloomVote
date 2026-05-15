import mongoose from "mongoose";
import env from "./env.config.js";

const connectDB = async () => {
    try {
        mongoose.set("strictQuery", true);
        const conn = await mongoose.connect(env.MONGODB_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);

    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}

export default connectDB;
