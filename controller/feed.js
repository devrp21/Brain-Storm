import Post from '../model/post.js';
import User from '../model/user.js';

import { validationResult } from 'express-validator';

// Creating Post
export const createPost = async (req, res, next) => {
    const title = req.body.title;
    const thought = req.body.thought;
    console.log(req.userId);
    const post = new Post({
        title: title,
        thought: thought,
        creator:req.userId
    });

    try {
        await post.save();
        res.send('Created Post');
    }
    catch (err) {
        next(err);
    }
};


export const getThought = async (req, res, next) => {
    const thoughtId = req.params.thoughtId;
    const thought = await Post.findById(thoughtId);

    try {

        if (!thought) {
            const error = new Error('Could not find post.');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ message: 'Thought fetched.', thought: thought });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };

};

export const getThoughts = async (req, res, next) => {
    try {
        const thoughts = await Post.find().populate('creator')
            .sort({ createdAt: -1 });
        // .skip((currentPage - 1) * perPage)
        // .limit(perPage);

        res.status(200).json({
            message: 'Fetched posts',
            thoughts: thoughts
        });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};