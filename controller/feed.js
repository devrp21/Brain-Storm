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

    if (req.session.isLoggedIn == false || req.session.isLoggedIn == undefined) {
        return res.redirect('/');
    }
    else {
        try {
            const thoughts = await Post.find()
                .populate('creator')
                .sort({ createdAt: -1 });

            const transformedThoughts = thoughts.map(thought => {
                const createdAt = new Date(thought.createdAt);
                const options = { day: 'numeric', month: 'long', year: 'numeric' };
                const formattedDate = createdAt.toLocaleDateString('en-IN', options);
                const title = thought.title;
                const th = thought.thought;
                const creatorName = thought.creator.name;
                return { title: title, thought: th, createdAt: formattedDate, creator: creatorName };
            });

            res.status(200).render('posts/allpost', {
                pageTitle: "Thoughts",
                thoughts: transformedThoughts,
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
};

export const myThoughts = async (req, res, next) => {

    const mythoughts = await Post.find({ creator: req.user._id }).sort({ createdAt: -1 });
    const transformedThoughts = mythoughts.map(thought => {
        const createdAt = new Date(thought.createdAt);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = createdAt.toLocaleDateString('en-IN', options);
        const title = thought.title;
        const th = thought.thought;
        return { title: title, thought: th, createdAt: formattedDate };
    });
    res.render('posts/mythoughts', { pageTitle: "My Thoughts", isAuth: true, mythoughts: transformedThoughts });
};

export const uploadImage=(req,res,next)=>{
    const image=req.file;
    if(!image){
        res.redirect('/feed/mythoughts');
    }
    else{
        const imageUrl=image.path;
        const user=new User({
            imageUrl:imageUrl
        });

        user.save();
        res.redirect('/feed/mythoughts')
    }
};
