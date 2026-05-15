import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
    voter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    poll: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Poll",
        required: true,
        index: true,
    },
    optionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
}, { timestamps: true });

voteSchema.index({ voter: 1, poll: 1, optionId: 1 }, { unique: true });
voteSchema.index({ voter: 1, poll: 1 });
voteSchema.index({ poll: 1, createdAt: -1 });
voteSchema.index({ voter: 1, createdAt: -1 });

const Vote = mongoose.model("Vote", voteSchema);

export default Vote;
