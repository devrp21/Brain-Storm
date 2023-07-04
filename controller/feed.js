import Post from '../model/post.js';
import User from '../model/user.js';

import { validationResult } from 'express-validator';


export const getCreateThought = (req, res, next) => {
    res.render('posts/postYourThought', {
        pageTitle: "Post Thought",
        errorMessage: '',
        isAuth: true
    });
}

// Creating Post
export const postCreateThought = async (req, res, next) => {
    const title = req.body.title;
    const thought = req.body.thought;
    
    const post = new Post({
        title: title,
        thought: thought,
        creator: req.userId
    });

    try {
        await post.save();
        res.redirect('/feed/thoughts');
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
    // console.log(req.session.user);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    console.log(req.user);
    console.log(req.session.isLoggedIn);
    if (req.session.isLoggedIn==false || req.session.isLoggedIn==undefined) {
       return res.redirect('/');
    }
    else{
        try {
            const thoughts = await Post.find()
                .populate('creator')
                .sort({ createdAt: -1 });
            // .skip((currentPage - 1) * perPage)
            // .limit(perPage);
            res.status(200).render('posts/allpost', {
                pageTitle: "Thoughts",
                thoughts: thoughts,
                errorMessage: '',
                isAuth: true
            });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }
    }
    

};

export const getHome = (req, res, next) => {
    res.render('home', { pageTitle: "Home", isAuth: false });
}
