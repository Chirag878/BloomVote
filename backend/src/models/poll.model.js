import mongoose from "mongoose"

const optionSchema = new mongoose.Schema({
    text:{
        type:String,
        required:true
    },
    voteCount:{
        type:Number,
        default:0
    }
}, {_id:true});

const pollSchema = new mongoose.Schema({
    creator:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
    },
    question:{
        type:String,
        required:true,
        trim:true,
        maxlength:1000
    },
    options:{
       type: [optionSchema],
       validate:{
        validator : (opts) => opts.length >= 2 && opts.length <= 10,
        message: "A poll must have between 2 and 10 options"        
       }
    },
    totalVotes:{
        type:Number,
        default:0,         
    },
    category:{
        type:String,
        enum:["General","Technology","Entertainment","Sports","Politics","Health","Education","Other"],
        default:"General",
        index:true
    },
    isActive:{
        type:Boolean,
        default:true,
        index:true
    },
    visibility: {
        type: String,
        enum: ["public", "private"],
        default: "public",
        index: true,
    },
    shareSlug: {
        type: String,
        unique: true,
        index: true,
        sparse: true,
    },
    expiresAt:{
        type:Date,
        default: () => new Date(Date.now() + 7*24*60*60*1000), // Default to 7 days from creation
    },
    allowsMultipleVotes:{
        type:Boolean,
        default:false
    }
}, {timestamps:true});

pollSchema.index({ creator: 1, createdAt: -1 });
pollSchema.index({ isActive: 1, expiresAt: 1 });
pollSchema.index({ totalVotes: -1, createdAt: -1 });

export default mongoose.model("Poll", pollSchema);
