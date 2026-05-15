import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES } from "../common/constants.js";

const userSchema = new mongoose.Schema(
    {
        userName:{
            type:String,
            required:[true,"User name is required"],
            unique:true,
            minlength:[5, "User name must be at least 5 characters long"],
            maxlength:[32, "User name cannot exceed 32 characters"],
            trim:true,
            match:[/^[a-z0-9_]+$/, "User name can only contain lowercase letters and numbers"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true, 
            trim: true,
            match: [/\S+@\S+\.\S+/, "Please use a valid email address"]
        },
        password: {
            type: String,
            required: [true, "Password is required"], 
            minlength: [6, "Password must be at least 6 characters long"],
            select: false,
        },
        role: {
            type: String,
            enum: Object.values(ROLES),
            default: ROLES.USER
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        avatar:{
            type:String,
            default:""
        },
    
        verificationToken: {type: String, select: false},
        refreshToken: {type: String, select: false},
        resetPasswordToken: {type: String, select: false},
        resetPasswordExpires: {type: Date},
        lastLoginAt: {type: Date},

        pollsCreated: { type:Number, default:0},
        quizzesCreated: { type:Number, default:0},
    },
    { timestamps: true ,
       toJSON: {
            transform(doc, ret) {
                delete ret.__v;
                delete ret.password;
                delete ret.refreshToken;
                delete ret.verificationToken;
                delete ret.resetPasswordToken;
                delete ret.resetPasswordExpires;
                return ret;
            },
        },
    }    
    
);


userSchema.index({role: 1, createdAt: -1});


userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.hasRole= function (role) {
    return this.role === role;
};

export default mongoose.model("User", userSchema);
