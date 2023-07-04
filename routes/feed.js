import express from "express";
import { postCreateThought, getCreateThought, getThoughts, getHome, myThoughts } from "../controller/feed.js";
import {isAuth} from '../middleware/is-auth.js';
import { body } from 'express-validator'


const router = express.Router();

router.get('/',getHome);

router.get('/thoughts', isAuth,getThoughts);

router.get('/postThought',isAuth,getCreateThought);

router.post('/postThought',isAuth, [
    body('title').trim().isLength({ min: 1 }),
    body('thought').trim().isLength({ min: 1 })
], postCreateThought);


router.get('/mythoughts',isAuth,myThoughts);

export default router;