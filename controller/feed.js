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
                const creatorId = thought.creator._id;
                const creatorName = thought.creator.name;
                var imageUrl = thought.creator.imageUrl;
                
                if(imageUrl==undefined){
                    imageUrl='images/th.jpeg';
                }

                return { title: title, thought: th, createdAt: formattedDate, creator: creatorName, imageUrl: imageUrl, creatorId: creatorId };
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

// export const getThoughts = async (req, res, next) => {
//     if (!req.session.isLoggedIn) {
//         return res.redirect('/');
//     } else {
//         try {
//             const thoughts = await Post.find()
//                 .populate('creator')
//                 .sort({ createdAt: -1 });

//             const getImageUrl = (imageUrl) => {
//                 return new Promise((resolve, reject) => {
//                     const parentDir = path.join(__dirname, '../'); // Go one level up
//                     const imagePath = path.resolve(parentDir, imageUrl);

//                     fs.access(imagePath, fs.constants.F_OK, (err) => {
//                         if (err) {
//                             // Image file does not exist, replace with another image
//                             resolve('images/th.jpeg');
//                         } else {
//                             resolve(imageUrl);
//                         }
//                     });
//                 });
//             };

//             const fallbackImageUrl = 'images/th.jpeg';
//             const __filename = fileURLToPath(import.meta.url);
//             const __dirname = path.dirname(__filename);
//             console.log(__filename);
//             console.log(__dirname);
//             const transformedThoughts = thoughts.map(async (thought) => {
//                 const createdAt = new Date(thought.createdAt);
//                 const options = { day: 'numeric', month: 'long', year: 'numeric' };
//                 const formattedDate = createdAt.toLocaleDateString('en-IN', options);
//                 const title = thought.title;
//                 const th = thought.thought;
//                 const creatorId = thought.creator._id;
//                 const creatorName = thought.creator.name;
//                 let imageUrl = thought.creator.imageUrl;
//                 // const imagePath = path.join(__dirname, imageUrl);
//                 const updatedImageUrl = await getImageUrl(imageUrl);
//                 // fs.access(imagePath, fs.constants.F_OK, (err) => {
//                 //     if (err) {
//                 //         // Image file does not exist, replace with another image
//                 //         imageUrl = 'images/th.jpeg';
//                 //     }
//                 // });
//                 return {
//                     title: title,
//                     thought: th,
//                     createdAt: formattedDate,
//                     creator: creatorName,
//                     imageUrl: updatedImageUrl,
//                     creatorId: creatorId
//                 };
//             });

//             res.status(200).render('posts/allpost', {
//                 pageTitle: 'Thoughts',
//                 thoughts: transformedThoughts,
//                 errorMessage: '',
//                 isAuth: true
//             });
//         } catch (err) {
//             const error = new Error(err);
//             error.httpStatusCode = 500;
//             return next(error);
//         }
//     }
// };

// export const getThoughts = async (req, res, next) => {
//     if (!req.session.isLoggedIn) {
//       return res.redirect('/');
//     }

//     try {
//       const thoughts = await Post.find()
//         .populate('creator')
//         .sort({ createdAt: -1 });

//       const fallbackImageUrl = 'images/th.jpeg';
//       const parentDir = path.dirname(fileURLToPath(import.meta.url));
// const __dirname = path.resolve(parentDir, '../');

//       const getImageUrl = async (imageUrl) => {
//         const imagePath = path.resolve(__dirname, imageUrl);

//         try {
//           await fs.access(imagePath, fs.constants.F_OK);
//           // Image file exists, use the original image URL
//           return imageUrl;
//         } catch (err) {
//           // Image file does not exist, replace with the fallback image URL
//           return fallbackImageUrl;
//         }
//       };

//       const transformedThoughts = await Promise.all(
//         thoughts.map(async (thought) => {
//           const createdAt = new Date(thought.createdAt);
//           const options = { day: 'numeric', month: 'long', year: 'numeric' };
//           const formattedDate = createdAt.toLocaleDateString('en-IN', options);
//           const title = thought.title;
//           const th = thought.thought;
//           const creatorId = thought.creator._id;
//           const creatorName = thought.creator.name;
//           const imageUrl = thought.creator.imageUrl;

//           const updatedImageUrl = await getImageUrl(imageUrl);

//           return {
//             title: title,
//             thought: th,
//             createdAt: formattedDate,
//             creator: creatorName,
//             imageUrl: updatedImageUrl,
//             creatorId: creatorId,
//           };
//         })
//       );

//       res.status(200).render('posts/allpost', {
//         pageTitle: 'Thoughts',
//         thoughts: transformedThoughts,
//         errorMessage: '',
//         isAuth: true,
//       });
//     } catch (err) {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     }
//   };

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
