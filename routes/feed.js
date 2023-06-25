import express from "express";
import { createPost } from "../controller/feed.js";
import {isAuth} from '../middleware/is-auth.js';
import { body } from 'express-validator'


const router = express.Router();

router.post('/post',isAuth, [
    body('title').trim().isLength({ min: 1 }),
    body('thought').trim().isLength({ min: 1 })
], createPost);


export default router;