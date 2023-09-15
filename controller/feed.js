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

// Creating Post
// export const postCreateThought = async (req, res, next) => {
//     const title = req.body.title;
//     const file = req.file;
//     console.log(file);
//     const thought = req.body.thought;
//     const hashtags = extractHashtagsFromThought(thought);

//     const thoughtWithoutHashtags = thought.replace(/#\w+/g, '').trim();

//     var post;
//     if (!file) {
//         post = new Post({
//             title: title,
//             thought: thoughtWithoutHashtags,
//             creator: req.userId,
//             hashtags
//         });
//     }
//     else {
//         if (file.mimetype.startsWith('image')) {
//             post = new Post({
//                 title: title,
//                 url: file.path,
//                 thought: thoughtWithoutHashtags,
//                 creator: req.userId,
//                 hashtags
//             });
//         } else if (file.mimetype.startsWith('video')) {
//             post = new Post({
//                 title: title,
//                 url: file.path,
//                 thought: thoughtWithoutHashtags,
//                 creator: req.userId,
//                 hashtags
//             });
//     }
// }

//     try {
//         const savedThought = await post.save();
//         const user = await User.findById(req.userId);
//         user.thoughts.push(savedThought._id);
//         await user.save();
//         res.redirect('/feed/thoughts');
//     }
//     catch (err) {
//         const error = new Error(err);
//         error.httpStatusCode = 500;
//         return next(error);
//     }
// };


export const postCreateThought = async (req, res, next) => {
    const title = req.body.title;
    const file = req.file;
    const thought = req.body.thought;
    const location = req.body.location;
    const hashtags = extractHashtagsFromThought(thought);

    const thoughtWithoutHashtags = thought.replace(/#\w+/g, '').trim();

    var post;
    if (!file) {
        post = new Post({
            title: title,
            thought: thoughtWithoutHashtags,
            location,
            creator: req.userId,
            hashtags
        });
    } else {
        if (file.mimetype.startsWith('image')) {
            post = new Post({
                title: title,
                url: file.path,
                thought: thoughtWithoutHashtags,
                creator: req.userId,
                location,
                hashtags
            });
        } else if (file.mimetype.startsWith('video')) {
            post = new Post({
                title: title,
                url: file.path,
                location,
                thought: thoughtWithoutHashtags,
                creator: req.userId,
                hashtags
            });
        } else {
            // Handle unsupported file types here if needed
        }
    }

    try {
        const savedThought = await post.save();
        const user = await User.findById(req.userId);
        user.thoughts.push(savedThought._id);
        await user.save();
        res.redirect('/feed/thoughts');
    } catch (err) {
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
                .populate({
                    path: 'comments.user',
                    select: 'name', // Select the fields you want to retrieve from the User model
                })
                .sort({ createdAt: -1 });

            const transformedThoughts = thoughts.map(thought => {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);

                const createdAt = new Date(thought.createdAt);
                const options = { day: 'numeric', month: 'long', year: 'numeric' };
                const formattedDate = createdAt.toLocaleDateString('en-IN', options);
                const title = thought.title;
                const url = thought.url;
                const th = thought.thought;
                const _id = thought._id.toString();
                const creatorId = thought.creator._id;
                const creatorName = thought.creator.name;
                const currentUserId = req.userId;
                const likes = thought.likes.length;
                const hashtags = thought.hashtags;
                const location = thought.location;
                const comments = thought.comments.map((comment) => {
                    return {
                        cid: comment._id,
                        id: comment.user._id.toString(),
                        user: comment.user.name, // Assuming the user schema has a 'username' field
                        comment: comment.comment,
                        createdAt: comment.createdAt,

                    };
                });

                const isFollowing = thought.creator.followers.includes(currentUserId);

                let imageUrl = thought.creator.imageUrl;
                let imagePath = '';
                let videoUrl = '';
                let imgUrl = ''

                if (url && url.endsWith('.mp4')) {
                    // Post contains a video
                    videoUrl = url;
                    imgUrl = null;
                } else {
                    imgUrl = url;
                    videoUrl = null;
                }

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

                return { _id, title, thought: th, createdAt: formattedDate, creator: creatorName, imageUrl, creatorId: creatorId, currentUserId, isFollowing, likes, imgUrl, videoUrl, hashtags, location, comments };

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

        const transformedThoughts = await Promise.all(mythoughts.map(async (thought) => {
            const createdAt = new Date(thought.createdAt);
            const options = { day: 'numeric', month: 'long', year: 'numeric' };
            const formattedDate = createdAt.toLocaleDateString('en-IN', options);
            const title = thought.title;
            const url = thought.url
            const th = thought.thought;
            const thoughtId = thought._id; // Get the thought ID
            const hashtags = thought.hashtags
            const location = thought.location;
            const comments = await Promise.all(thought.comments.map(async (comment) => {
                const uname = await User.findById(comment.user._id);

                return {
                    cid: comment._id,
                    id: comment.user._id.toString(),
                    user: uname.name, // Assuming the user schema has a 'username' field
                    comment: comment.comment,
                    createdAt: comment.createdAt,
                };
            }));


            let videoUrl = '';
            let imgUrl = ''

            if (url && url.endsWith('.mp4')) {
                // Post contains a video
                videoUrl = url;
                imgUrl = null;
            } else {
                imgUrl = url;
                videoUrl = null;
            }

            return { thoughtId: thoughtId, title: title, thought: th, createdAt: formattedDate, imgUrl, videoUrl, hashtags, location, comments };
        }));

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
        const postImage=thought.url;

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

        res.status(200).render('posts/sharedThought', { pageTitle: 'Shared Thought', imageUrl, creator: creator.name, title, thought: th, isAuth: false, postImage });
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


export const getRelatedThoughts = async (req, res, next) => {

    if (req.session.isLoggedIn == false || req.session.isLoggedIn == undefined) {
        return res.redirect('/');
    }
    else {
        try {
            const hashtag = req.params.hashtag; // Extract the hashtag from the query parameter
            const relatedPosts = await Post.find({ hashtags: hashtag })
                .populate('creator') // Populate the 'creator' field
                .sort({ createdAt: -1 })
                .exec();

            const transformedThoughts = relatedPosts.map(thought => {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);

                const createdAt = new Date(thought.createdAt);
                const options = { day: 'numeric', month: 'long', year: 'numeric' };
                const formattedDate = createdAt.toLocaleDateString('en-IN', options);
                const title = thought.title;
                const url = thought.url;
                const th = thought.thought;
                const _id = thought._id;
                const creatorId = thought.creator._id;
                const creatorName = thought.creator.name;
                const currentUserId = req.userId;
                const likes = thought.likes.length;
                const hashtags = thought.hashtags;


                const isFollowing = Array.isArray(thought.creator.followers) && thought.creator.followers.includes(currentUserId);


                let imageUrl = thought.creator.imageUrl;
                let imagePath = '';
                let videoUrl = '';
                let imgUrl = ''

                if (url && url.endsWith('.mp4')) {
                    // Post contains a video
                    videoUrl = url;
                    imgUrl = null;
                } else {
                    imgUrl = url;
                    videoUrl = null;
                }

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

                return { _id, title, thought: th, createdAt: formattedDate, creator: creatorName, imageUrl, creatorId: creatorId, currentUserId, isFollowing, likes, imgUrl, videoUrl, hashtags };

            });


            res.status(200).render('posts/relatedThought', {
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

// Step 3: Count hashtag occurrences

// function countHashtags(thoughts) {
//     const hashtagCountMap = new Map();

//     thoughts.forEach((thought) => {
//         thought.hashtags.forEach((hashtag) => {
//             hashtagCountMap.set(hashtag, (hashtagCountMap.get(hashtag) || 0) + 1);
//         });
//     });

//     return hashtagCountMap;
// }

// export const getTrendingThoughts = async (req, res, next) => {
//     try {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0); // Set time to the beginning of the day
//         const thoughts = await Post.find({ createdAt: { $gte: today } }).exec();
//         console.log(thoughts);

//         // Step 2: Extract hashtags from thoughts
//         thoughts.forEach((thought) => {
//             thought.hashtags = extractHashtagsFromThought(thought.thought);
//         });

//         // Step 3: Count hashtag occurrences
//         const hashtagCountMap = countHashtags(thoughts);
//         console.log(hashtagCountMap);

//         // Step 4: Sort hashtags by occurrence
//         const sortedHashtags = [...hashtagCountMap.entries()].sort((a, b) => b[1] - a[1]);
//         console.log(sortedHashtags);

//         // Step 5: Return top N hashtags used today
//         const N = 10; // You can change N to get more or fewer trending hashtags
//         const trendingHashtags = sortedHashtags.slice(0, N).map((entry) => entry[0]);

//         res.status(200).json({ trendingHashtags });
//     } catch (err) {
//         next(err);
//     }
// };


// export const getTrendingThoughts = async (req, res, next) => {
//     try {
//       const today = new Date();
//       today.setHours(0, 0, 0, 0); // Set the time to the beginning of today

//       // Fetch all thoughts posted today
//       const thoughtsToday = await Post.find({ createdAt: { $gte: today } }).exec();
//   console.log(thoughtsToday);
//       // Create a map to store hashtags and their occurrences
//       const hashtagMap = new Map();

//       // Loop through each thought and extract hashtags
//       thoughtsToday.forEach((thought) => {
//         console.log('hell'+thought+'hell');
//         const hashtags = extractHashtagsFromThought(thought.hashtags);
//         console.log('h'+hashtags+'h');
//         hashtags.forEach((tag) => {
//             console.log('tag'+tag+'tag');
//           if (hashtagMap.has(tag)) {
//             // Increment count if the hashtag already exists in the map
//             hashtagMap.set(tag, hashtagMap.get(tag) + 1);
//           } else {
//             // Add the hashtag to the map with a count of 1 if it's not already present
//             hashtagMap.set(tag, 1);
//           }
//         });
//       });


//       // Sort the map in descending order based on hashtag counts
//       const sortedHashtags = new Map(
//         [...hashtagMap.entries()].sort((a, b) => b[1] - a[1])
//       );
//       console.log(sortedHashtags);

//       // Extract the top trending hashtags from the sorted map
//       const trendingHashtags = [...sortedHashtags.keys()].slice(0, 10); // Change 10 to the desired number of top hashtags you want to display
//         console.log(trendingHashtags);
//     //   res.render('trending_hashtags', {
//     //     pageTitle: 'Trending Hashtags',
//     //     hashtags: trendingHashtags,
//     //   });
//     } catch (err) {
//       next(err);
//     }
//   };



// export const getTrendingThoughts = async (req, res, next) => {
//     try {
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);

//       const thoughts = await Post.find({ createdAt: { $gte: today } }).exec();

//       // Count the hashtags from all the thoughts
//       const hashtagCountMap = new Map();
//       thoughts.forEach((thought) => {
//         thought.hashtags.forEach((hashtag) => {
//           if (hashtagCountMap.has(hashtag)) {
//             hashtagCountMap.set(hashtag, hashtagCountMap.get(hashtag) + 1);
//           } else {
//             hashtagCountMap.set(hashtag, 1);
//           }
//         });
//       });

//       // Sort the hashtags by count in descending order
//       const sortedHashtags = [...hashtagCountMap.entries()].sort((a, b) => b[1] - a[1]);

//       // Get the top N trending hashtags (e.g., top 10)
//       const topTrendingHashtags = sortedHashtags.slice(0, 10).map((entry) => entry[0]);

//       res.status(200).render('posts/trending',{ pageTitle:"Trending",isAuth:true, trendingHashtags: topTrendingHashtags });
//     } catch (err) {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     }
//   };


export const getTrendingThoughts = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get thoughts with the hashtag from today and previous days
        const thoughts = await Post.find({
            $or: [
                { createdAt: { $gte: today } }, // Thoughts from today
                { createdAt: { $lt: today }, hashtags: req.params.hashtag }, // Thoughts from previous days with the hashtag
            ],
        }).exec();

        // Count the hashtags from all the thoughts
        const hashtagCountMap = new Map();
        thoughts.forEach((thought) => {
            thought.hashtags.forEach((hashtag) => {
                const lowercaseHashtag = hashtag.toLowerCase(); // Convert to lowercase
                if (hashtagCountMap.has(lowercaseHashtag)) {
                    hashtagCountMap.set(lowercaseHashtag, hashtagCountMap.get(lowercaseHashtag) + 1);
                } else {
                    hashtagCountMap.set(lowercaseHashtag, 1);
                }
            });
        });

        // Sort the hashtags by count in descending order
        const sortedHashtags = [...hashtagCountMap.entries()].sort((a, b) => b[1] - a[1]);

        // Get the top N trending hashtags (e.g., top 10)
        const topTrendingHashtags = sortedHashtags.slice(0, 10).map((entry) => ({
            hashtag: entry[0],
            count: entry[1],
        }));

        res.status(200).render('posts/trending', { pageTitle: "Trending", isAuth: true, trendingHashtags: topTrendingHashtags });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};



export const postComment = async (req, res, next) => {
    try {
        const thoughtId = req.params.id;
        const { comment } = req.body;

        // Find the post by ID
        const post = await Post.findById(thoughtId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Add the new comment to the comments array
        post.comments.push({
            user: req.userId, // Assuming you have a user object in req.user
            comment: comment,
        });

        // Save the updated post with the new comment
        await post.save();

        // Redirect back to the same page or handle as needed
        res.redirect('back');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};



export const deleteComment = async (req, res, next) => {
    const { thoughtId, commentId } = req.params;
    const currentUserId = req.userId;

    try {
        // Find the thought by its ID
        const thought = await Post.findById(thoughtId);

        // Find the index of the comment to be deleted
        const commentIndex = thought.comments.findIndex(
            (comment) => comment._id.toString() === commentId
        );

        // Check if the current user is the creator of the comment
        if (commentIndex >= 0 && thought.comments[commentIndex].user.toString() === currentUserId) {
            // Remove the comment from the thought's comments array
            thought.comments.splice(commentIndex, 1);

            // Save the updated thought
            await thought.save();
        }

        // Redirect back to the thoughts page after deletion
        res.redirect('/feed/mythoughts');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};


export const deleteCommentAdmin = async (req, res, next) => {
    const { thoughtId, commentId } = req.params;
    const currentUserId = req.userId;

    try {
        // Find the thought by its ID
        const thought = await Post.findById(thoughtId);

        // Find the index of the comment to be deleted
        const commentIndex = thought.comments.findIndex(
            (comment) => comment._id.toString() === commentId
        );

        // Check if the current user is the creator of the comment
        if (commentIndex >= 0) {
            // Remove the comment from the thought's comments array
            thought.comments.splice(commentIndex, 1);

            // Save the updated thought
            await thought.save();
        }

        // Redirect back to the thoughts page after deletion
        res.redirect('/feed/mythoughts');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

