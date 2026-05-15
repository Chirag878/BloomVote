import mongoose from "mongoose"

const quizSchema = new mongoose.Schema({
    creator:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true,
    },
    title:{
        type:String,
        required:true,
        trim:true,
        maxlength:200
    },
    description:{
        type:String,
        trim:true,
        maxlength:1000,
        required:true
    },
    category:{
        type:String,
        enum:["General","Technology","Entertainment","Sports","Politics","Health","Education","Other"],
        default:"General",
        index:true
    },  
    timeLimit: {
        type: Number, 
        default: 30,
    },
    isPublished:{
        type:Boolean,
        default:false, 
    },
    totalQuestions:{
        type:Number,
        default:0 
    },
    totalAttempts:{
        type:Number,
        default:0
    },
}, {timestamps:true});

quizSchema.index({ creator: 1, createdAt: -1 });    
quizSchema.index({ isPublished: 1, category: 1, createdAt: -1 });
quizSchema.index({ totalAttempts: -1, createdAt: -1 });

export default mongoose.model("Quiz", quizSchema);
