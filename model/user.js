import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    imageUrl: {
        type:String
      },
    thoughts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }]
});

const User = mongoose.model('User', userSchema);

export default User;