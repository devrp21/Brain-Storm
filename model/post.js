import mongoose from "mongoose";

const Schema = mongoose.Schema;

const thoughtSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
        default: undefined
    },
    thought: {
        type: String,
        required: true
    },
    location:{
        type:String
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Like'
    }],
    hashtags: [{
        type: String,
        trim: true,
        lowercase: true
      }],
      comments: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
          comment: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
        },
      ],
}, {
    timestamps: true
});

const Post = mongoose.model('Post', thoughtSchema);

export default Post;