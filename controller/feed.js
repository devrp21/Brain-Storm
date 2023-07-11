import Post from '../model/post.js';
import User from '../model/user.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


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
        const savedThought = await post.save();
        const user = await User.findById(req.userId);
        user.thoughts.push(savedThought._id);
        await user.save();
        res.redirect('/feed/thoughts');
    }
    catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
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
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
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
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);

                const createdAt = new Date(thought.createdAt);
                const options = { day: 'numeric', month: 'long', year: 'numeric' };
                const formattedDate = createdAt.toLocaleDateString('en-IN', options);
                const title = thought.title;
                const th = thought.thought;
                const _id = thought._id;
                const creatorId = thought.creator._id;
                const creatorName = thought.creator.name;
                const currentUserId = req.userId;
                // var imageUrl = thought.creator.imageUrl;
                // console.log(imageUrl);
                // var im=imageUrl.replace(/\\/g, '/');
                // console.log(typeof(im));

                // const imagePath = path.join(__dirname, '../', im);
                // console.log(typeof(imagePath));
                // if(imageUrl==undefined){
                //     imageUrl='images/th.jpeg';
                // }

                // return { title: title, thought: th, createdAt: formattedDate, creator: creatorName, imageUrl: imageUrl, creatorId: creatorId };

                let imageUrl = thought.creator.imageUrl;
                let imagePath = '';

                if (imageUrl) {
                    const updatedImageUrl = imageUrl.replace(/\\/g, '/');
                    imagePath = path.join(__dirname, '../', updatedImageUrl);

                    if (!fs.existsSync(imagePath)) {
                        // Image file does not exist, replace with another image
                        imageUrl = 'images/th.jpeg';
                        imagePath = path.join(__dirname, '../', imageUrl);
                    }
                } else {
                    imageUrl = 'images/th.jpeg';
                    imagePath = path.join(__dirname, '../', imageUrl);
                }

                return { _id, title, thought: th, createdAt: formattedDate, creator: creatorName, imageUrl, creatorId: creatorId, currentUserId };

            });

            res.status(200).render('posts/allpost', {
                pageTitle: "Thoughts",
                thoughts: transformedThoughts,
                errorMessage: '',
                isAuth: true
            });
        }
        catch (err) {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        }
    }


};


export const getHome = (req, res, next) => {
    res.render('home', { pageTitle: "Home", isAuth: false });
};

export const myThoughts = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('thoughts');
        const mythoughts = user.thoughts.sort((a, b) => b.createdAt - a.createdAt);

        const transformedThoughts = mythoughts.map((thought) => {
            const createdAt = new Date(thought.createdAt);
            const options = { day: 'numeric', month: 'long', year: 'numeric' };
            const formattedDate = createdAt.toLocaleDateString('en-IN', options);
            const title = thought.title;
            const th = thought.thought;
            const thoughtId = thought._id; // Get the thought ID
            return { thoughtId: thoughtId, title: title, thought: th, createdAt: formattedDate };
        });

        res.render('posts/mythoughts', {
            pageTitle: 'My Thoughts',
            isAuth: true,
            mythoughts: transformedThoughts,
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};


export const followUser = async (req, res, next) => {
    const { thoughtId } = req.body;
    const userId = req.user._id.toString();
    
    try {
        // Find the thought by ID
        const thought = await Post.findById(thoughtId);

        if (!thought) {
            return res.status(404).json({ message: 'Thought not found' });
        }

        // Find the thought's creator and update their followers array
        const creator = await User.findByIdAndUpdate(
            thought.creator,
            { $addToSet: { followers: userId } },
            { new: true }
        );

        const following = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { following: thought.creator } }, { new: true });


        if (!creator || !following) {
            return res.status(404).json({ message: 'Creator not found' });
        }

        // Redirect the user back to the previous page
        res.redirect('back');
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'An error occurred' });
    }
};

