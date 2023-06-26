import express from "express";
<<<<<<< HEAD
import { postCreateThought, getCreateThought, getThoughts, getHome } from "../controller/feed.js";
=======
import { createPost } from "../controller/feed.js";
>>>>>>> e16239878b8cc0b7e0f37f3aa02c7876eef757df
import {isAuth} from '../middleware/is-auth.js';
import { body } from 'express-validator'


const router = express.Router();

<<<<<<< HEAD
router.get('/',getHome);

router.get('/thoughts', isAuth,getThoughts);

router.get('/postThought',isAuth,getCreateThought);

router.post('/postThought',isAuth, [
    body('title').trim().isLength({ min: 1 }),
    body('thought').trim().isLength({ min: 1 })
], postCreateThought);
=======
router.post('/post',isAuth, [
    body('title').trim().isLength({ min: 1 }),
    body('thought').trim().isLength({ min: 1 })
], createPost);
>>>>>>> e16239878b8cc0b7e0f37f3aa02c7876eef757df


export default router;