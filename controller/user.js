import bcrypt from 'bcryptjs';
import { validationResult, check } from 'express-validator';
import jwt from "jsonwebtoken";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from "../model/user.js";
import Post from "../model/post.js";


export const getUserProfile = async (req, res, next) => {
    try {
        const username = req.params.userName;
        // Find the user based on the username
        const user = await User.findOne({ name: username }).exec();
        if (user._id == req.userId) {
            res.redirect('/feed/mythoughts');
        }
        else {


            if (!user) {
                // Handle case when user is not found
                return res.status(404).render('user-not-found', { pageTitle: 'User Not Found' });
            }

            const thoughtIds = user.thoughts; // Assuming user.thoughts is an array of thought IDs
            const thoughts = [];

            // Fetch each thought from the post collection based on the thought IDs
            for (const thoughtId of thoughtIds) {
                const thought = await Post.findById(thoughtId).exec();
                if (thought) {
                    // thoughts.push(thought);
                    let imgUrl;
                    let videoUrl;

                    if (thought.url && thought.url.endsWith('.mp4')) {
                        // Post contains a video
                        videoUrl = thought.url;
                        imgUrl = null; // Replace with a default video thumbnail image URL
                    } else {
                        // Post contains an image
                        imgUrl = thought.url;
                        videoUrl = null; // Replace with a default image URL if imageUrl is not available
                    }

                    const transformedThought = {
                        _id: thought._id,
                        title: thought.title,
                        thought: thought.thought,
                        createdAt: new Date(thought.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
                        creator: thought.creator.name,
                        creatorId: thought.creator._id,
                        currentUserId: req.userId, // Assuming you have req.userId available
                        likes: thought.likes.length,
                        videoUrl,
                        imgUrl,
                        hashtags: thought.hashtags
                    };

                    thoughts.push(transformedThought);

                }
            }

            // console.log(thoughts);
            res.render('posts/mythoughts', { pageTitle: `${username} Profile`, username, mythoughts: thoughts, visitor: true, isAuth: true });
        }
    } catch (err) {
        next(err);
    }

};


export const uploadImage = async (req, res, next) => {
    const image = req.file;
    if (!image) {
        res.redirect('/feed/myprofile');
    } else {
        const imageUrl = image.path;
        const user = req.user;

        // Delete the old image file
        if (user.imageUrl) {
            fs.unlink(user.imageUrl, (err) => {
                if (err) {
                    // console.error('Error deleting old image:', err);
                }
            });
        }

        // Update the user's image URL
        user.imageUrl = imageUrl;

        try {
            await user.save();
            res.redirect('/user/myprofile');
        } catch (err) {
            next(err);
        }
    }
};


// export const getMyProfile = (req, res, next) => {
//     const __filename = fileURLToPath(import.meta.url);
//     const __dirname = path.dirname(__filename);
//     const username = req.user.name;
//     const email = req.user.email;
//     let imageUrl = req.user.imageUrl;
//     const imagePath = `${__dirname}\\${imageUrl}`;
//     imageUrl = imageUrl.replace('\\', '/');
//     console.log(imagePath);
//     console.log(imageUrl);

//     fs.access(imagePath, fs.constants.F_OK, (err) => {
//       if (err) {
//         // Image file does not exist, replace with another image
//         imageUrl = 'images\\th.jpeg';
//       }});
//       console.log(imageUrl);
//     res.render('profile/myprofile', { pageTitle: 'My Profile', isAuth: true, imageUrl: imageUrl, username: username, email: email })
// };

export const getMyProfile = (req, res, next) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const username = req.user.name;
    const email = req.user.email;
    const followers = req.user.followers.length;
    const following = req.user.following.length;
    const thoughts = req.user.thoughts.length;
    var imageUrl = req.user.imageUrl;


    const imagePath = path.join(__dirname, '../', imageUrl.replace(/\\/g, '/'));

    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            // Image file does not exist, replace with another image
            // console.log('no file');
            imageUrl = 'images/th.jpeg';
        }

        res.render('profile/myprofile', {
            pageTitle: 'My Profile',
            isAuth: true,
            imageUrl: imageUrl,
            username: username,
            email: email,
            followers: followers,
            following: following,
            thoughts: thoughts
        });
    });

};

// delete thought
export const deleteThought = async (req, res, next) => {
    try {
        const thoughtId = req.params.thoughtId;

        // Delete thought from the posts collection
        await Post.findByIdAndDelete(thoughtId);

        // Remove thought ID from the user's thoughts array
        const user = await User.findById(req.user._id);
        user.thoughts.pull(thoughtId);
        await user.save();

        res.redirect('/feed/mythoughts');
    } catch (err) {
        next(err);
    }
};

export const editThoughtGet = async (req, res, next) => {
    try {
        const thoughtId = req.params.thoughtId;


        const post = await Post.findById(thoughtId);
        const title = post.title;
        const url = post.url;
        const thought = post.thought;
        const location=post.location;

        res.render('posts/editYourThought', { pageTitle: "Edit Your Thought", isAuth: true, errorMessage: '', title: title, thought: thought, thoughtId, url,location });
    } catch (err) {
        next(err);
    }
};

function extractHashtagsFromThought(thought) {
    const regex = /#(\w+)/g;
    const hashtags = [];
    let match;
    while ((match = regex.exec(thought)) !== null) {
        hashtags.push(match[1]);
    }
    return hashtags;
}

export const editThoughtPost = async (req, res, next) => {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const thoughtId = req.params.thoughtId;
        let location=req.body.location;
        let oldLocation;
        // const url = req.file
        const title = req.body.title;
        const thought = req.body.thought;

        const hashtags = extractHashtagsFromThought(thought);
        const thoughtWithoutHashtags = thought.replace(/#\w+/g, '').trim();


        let newurl; // Declare url here to access it outside the if block
        let url;
        let isUrlChanges = false;
        let existingHashtags = [];

        // Check if a file is selected
        if (req.file) {
            newurl = req.file.path;
            isUrlChanges = true;
            if (isUrlChanges) {
                const existingPost = await Post.findById(thoughtId);
                oldLocation=existingPost.location;
                if (existingPost) {
                    url = existingPost.url;
                }
                const existingImagePath = path.join(__dirname, '../', url);
                fs.unlink(existingImagePath, (err) => {
                    if (err) {
                        console.error('Error deleting old image:', err);
                    } else {
                        console.log('Old image deleted successfully');
                    }
                });
                existingHashtags=existingPost.hashtags;
            }
            url = newurl
        } else {
            // If no file is selected, retrieve the current url from the database
            const existingPost = await Post.findById(thoughtId);
            oldLocation=existingPost.location;
            if (existingPost) {
                url = existingPost.url;
                existingHashtags = existingPost.hashtags;

            }
            // const editedHashtags = extractHashtagsFromThought(thoughtWithoutHashtags);
            // console.log(editedHashtags);
            if (hashtags.length > 0) {
                existingHashtags = existingHashtags.concat(hashtags);

            }
        }

        if(oldLocation==location){
            location=oldLocation
        }
        else{
            location=location
        }

        // Update the post in the database
        const post = await Post.findByIdAndUpdate(
            thoughtId,
            {
                title: title,
                thought: thoughtWithoutHashtags,
                url: url,
                location,
                hashtags: existingHashtags,
                updatedAt: new Date()
            },
            { new: true }
        );

        // // If the url is changed, delete the old image from storage
        // if (isUrlChanges) {
        //     const existingImagePath = path.join(__dirname, '../', url);
        //     fs.unlink(existingImagePath, (err) => {
        //         if (err) {
        //             console.error('Error deleting old image:', err);
        //         } else {
        //             console.log('Old image deleted successfully');
        //         }
        //     });
        // }

        res.redirect('/feed/mythoughts');
    } catch (err) {
        next(err);
    }
};