import Post from '../model/post.js';
import User from '../model/user.js';

import { validationResult } from 'express-validator';

<<<<<<< HEAD

export const getCreateThought = (req, res, next) => {
    res.render('posts/postYourThought', {
        pageTitle: "Post Thought",
        errorMessage: '',
        isAuth: true
    });
}

=======
>>>>>>> e16239878b8cc0b7e0f37f3aa02c7876eef757df
// Creating Post
export const postCreateThought = async (req, res, next) => {
    const title = req.body.title;
    const thought = req.body.thought;
<<<<<<< HEAD
    
    const post = new Post({
        title: title,
        thought: thought,
        creator: req.userId
=======
    console.log(req.userId);
    const post = new Post({
        title: title,
        thought: thought,
        creator:req.userId
>>>>>>> e16239878b8cc0b7e0f37f3aa02c7876eef757df
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
<<<<<<< HEAD
    // console.log(req.session.user);
    // console.log(req.user);
    console.log(req.session.isLoggedIn);
    if (req.session.isLoggedIn==false) {
       return res.redirect('/');
    }
    else{
        try {
            const thoughts = await Post.find()
                .populate('creator')
                .sort({ createdAt: -1 });
            // .skip((currentPage - 1) * perPage)
            // .limit(perPage);
            console.log(thoughts.creator);
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
=======
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
>>>>>>> e16239878b8cc0b7e0f37f3aa02c7876eef757df
