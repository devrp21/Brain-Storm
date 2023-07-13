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
    const image = req.file;
    const thought = req.body.thought;
    var post;
    if (!image) {
        post = new Post({
            title: title,
            thought: thought,
            creator: req.userId
        });
    }
    else {
        post = new Post({
            title: title,
            postImage: image.path,
            thought: thought,
            creator: req.userId
        });
    }

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
                const postImage=thought.postImage;
                const th = thought.thought;
                const _id = thought._id;
                const creatorId = thought.creator._id;
                const creatorName = thought.creator.name;
                const currentUserId = req.userId;
                const likes = thought.likes.length;

                const isFollowing = thought.creator.followers.includes(currentUserId);

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

                return { _id, title, thought: th, createdAt: formattedDate, creator: creatorName, imageUrl, creatorId: creatorId, currentUserId, isFollowing, likes,postImage };

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
            const postImage=thought.postImage
            const th = thought.thought;
            const thoughtId = thought._id; // Get the thought ID
            return { thoughtId: thoughtId, title: title, thought: th, createdAt: formattedDate, postImage };
        });

        res.render('posts/mythoughts', {
            pageTitle: 'My Thoughts',
            isAuth: true,
            visitor: false,
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
        res.redirect('/feed/thoughts');
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'An error occurred' });
    }
};

export const shareThought = async (req, res, next) => {
    const thoughtId = req.params.thoughtId;

    try {
        // Retrieve the thought by ID
        const thought = await Post.findById(thoughtId);

        if (!thought) {
            const error = new Error();
            error.httpStatusCode = 500;
            return next(error);
        }

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const title = thought.title;
        const th = thought.thought;
        const creatorId = thought.creator;
        const creator = await User.findById(creatorId).select('-_id name');
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

        res.status(200).render('posts/sharedThought', { pageTitle: 'Shared Thought', imageUrl, creator: creator.name, title, thought: th, isAuth: false });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'An error occurred' });
    }
};


export const likeThought = async (req, res, next) => {
    // const thoughtId = req.body.thoughtId;

    // try {
    //     // Find the thought in the database
    //     const thought = await Post.findById(thoughtId);

    //     if (!thought) {
    //         return res.status(404).json({ error: 'Thought not found' });
    //     }

    //     // Check if the current user has already liked the thought
    //     const alreadyLiked = thought.likes.includes(req.user._id);

    //     if (alreadyLiked) {
    //         // If already liked, remove the user's like
    //         thought.likes.pull(req.user._id);
    //     } else {
    //         // If not liked, add the user's like
    //         thought.likes.push(req.user._id);
    //     }

    //     // Save the updated thought in the database
    //     await thought.save();

    //     res.status(200).json({ message: 'Like updated successfully', thought });
    // } catch (error) {
    //     res.status(500).json({ error: 'An error occurred' });
    // }

    const thoughtId = req.params.thoughtId;

    try {
        // Find the thought by its ID
        const thought = await Post.findById(thoughtId);

        if (!thought) {
            return res.status(404).json({ error: 'Thought not found' });
        }

        thought.likes = thought.likes || [];
        // Check if the user has already liked the thought
        const userId = req.user._id; // Assuming you have the user ID in the request object

        const userLiked = thought.likes.includes(userId);

        // Toggle the like state
        if (userLiked) {
            // User already liked the thought, so remove the like
            thought.likes = thought.likes.filter(like => like !== userId);
        } else {
            // User didn't like the thought, so add the like
            thought.likes.push(userId);
        }

        // Save the updated thought
        const updatedThought = await thought.save();

        res.json({ likes: updatedThought.likes.length, userLiked: !userLiked });
    } catch (error) {
        console.error('Error toggling like state:', error);
        res.status(500).json({ error: 'An error occurred while toggling like state' });
    }
};