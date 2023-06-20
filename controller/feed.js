import Post from '../model/post.js';
import User from '../model/user.js';

// Creating Post
export const createPost = async (req, res, next) => {
    const title = req.body.title;
    const thought = req.body.thought;

    const post = new Post({
        title: title,
        thought: thought,
        // creator:req.userId
    });

    try {
        await post.save();
        res.send('Created Post');
    }
    catch (err) {
        next(err);
    }
};