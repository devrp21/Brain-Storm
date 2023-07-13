import mongoose from "mongoose";

const Schema = mongoose.Schema;

const thoughtSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    postImage: {
        type: String,
        default: undefined
    },
    thought: {
        type: String,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Like'
    }]
}, {
    timestamps: true
});

const Post = mongoose.model('Post', thoughtSchema);

export default Post;