import express from "express";
import { body, check } from 'express-validator'
import { getUserProfile,uploadImage, getMyProfile ,deleteThought} from "../controller/user.js";
import User from "../model/user.js";
import {isAuth} from '../middleware/is-auth.js';

const router = express.Router();

// To see other user's profile
router.get('/profile/:userName',isAuth,getUserProfile);

router.post('/uploadImage',isAuth,uploadImage);

router.get('/myprofile',isAuth,getMyProfile);

router.post('/deleteThought/:thoughtId', deleteThought);

export default router;