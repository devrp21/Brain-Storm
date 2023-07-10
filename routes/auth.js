import express from "express";
import { body, check } from 'express-validator'
import { createUser,  loginUser, loginUserPost, logoutUser, signupUser } from "../controller/auth.js";
import User from "../model/user.js";


const router = express.Router();

router.get('/signup', signupUser);

router.post('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom(async (value,{req})=>{
            const userDoc = await User.findOne({ email: value });
            if (userDoc) {
                return Promise.reject('Email exists already, pick up diffrent one.');
            }
        }),

    body('password', 'Password should be more than 6 character long')
        .isAlphanumeric()
        .trim()
        .isLength({ min: 6 }),

    body('username')
        .trim()
        .not()
        .isEmpty()
        .isLength({ min: 1 })
        .custom(async (value,{req})=>{
            const userDoc = await User.findOne({name:value});
            if (userDoc) {
                return Promise.reject('Username exists choose different one.');
            }
        })
], createUser);

router.get('/login', [
    body('email')
        .isEmail()
        .withMessage('Please enter valid email.')
        .normalizeEmail(),
    body('passowrd', 'Password has to be valid')
        .isLength({ min: 6 })
        .isAlphanumeric()
        .trim()
], loginUser);

router.post('/login', loginUserPost);

router.post('/logout',logoutUser);



export default router;