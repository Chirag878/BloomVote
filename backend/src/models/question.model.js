import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    quiz:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Quiz",
        required:true,
        index:true
    },
    text:{
        type:String,
        required:true, 
        trim:true,
    },
    options:[
        {
            text:{
                type:String,
                required:true,
                trim:true
            },
            isCorrect:{
                type:Boolean,
                default:false
            }
        }
    ],
    explanation:{
        type:String,
        default:"",
    },
    order:{
        type:Number,
        required:true
    },
    points:{
        type:Number,
        default:1
    }
}, {timestamps:true});

questionSchema.index({ quiz: 1, order: 1 }, { unique: true }); 
questionSchema.index({ quiz: 1, createdAt: 1 });

export default mongoose.model("Question", questionSchema);
