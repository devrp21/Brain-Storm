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
                thoughts.push(thought);
            }
        }

        console.log(thoughts);
        res.render('user-profile', { pageTitle: 'User Profile', username, thoughts });
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
    var imageUrl = req.user.imageUrl;

    const imagePath = path.join(__dirname, '../', imageUrl.replace(/\\/g, '/'));

    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            // Image file does not exist, replace with another image
            console.log('no file');
            imageUrl = 'images/th.jpeg';
        }
        
        res.render('profile/myprofile', {
            pageTitle: 'My Profile',
            isAuth: true,
            imageUrl: imageUrl,
            username: username,
            email: email
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