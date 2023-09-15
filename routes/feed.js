import express from "express";
import { postCreateThought, getCreateThought, getThoughts, getHome, myThoughts, followUser, shareThought, likeThought, getRelatedThoughts, getTrendingThoughts, postComment, deleteComment, deleteCommentAdmin } from "../controller/feed.js";
import { isAuth } from '../middleware/is-auth.js';
import { body } from 'express-validator'


const router = express.Router();

router.get('/', getHome);

router.get('/thoughts', isAuth, getThoughts);

router.get('/postThought', isAuth, getCreateThought);

router.post('/postThought', isAuth, [
    body('title').trim().isLength({ min: 1 }),
    body('thought').trim().isLength({ min: 1 })
], postCreateThought);


router.get('/mythoughts', isAuth, myThoughts);

router.post('/follow', followUser);

router.get('/share/:thoughtId', shareThought);

router.post('/like/:thoughtId', isAuth, likeThought);

router.get('/related/:hashtag', isAuth, getRelatedThoughts);

router.get('/trending',isAuth, getTrendingThoughts);

router.post('/comment/:id',isAuth,postComment);

router.post('/deleteComment/:thoughtId/:commentId',isAuth,deleteComment);

router.post('/deleteCommentAdmin/:thoughtId/:commentId',isAuth,deleteCommentAdmin);


export default router;