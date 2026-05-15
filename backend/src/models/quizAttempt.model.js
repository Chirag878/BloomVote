import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  answers:[{
    question:{type:mongoose.Schema.Types.ObjectId,
        ref: "Question"
    },
    selectedOption:{type:mongoose.Schema.Types.ObjectId},
    isCorrect:{type:Boolean},
    timeTaken:{type:Number}
  }],
  score: {
    type: Number,
    default: 0,
  },
  passed: {
    type: Boolean,
    default: false,
  },
  completedAt:{
    type: Date,
    default: null,
  },
  startedAt:{
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });  

attemptSchema.index({ user: 1, quiz: 1 });
attemptSchema.index({ quiz: 1, score: -1 });
attemptSchema.index({ user: 1, createdAt: -1 });


const QuizAttempt = mongoose.model("QuizAttempt", attemptSchema);

export { QuizAttempt };
export default QuizAttempt;
