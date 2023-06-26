import express from "express";
<<<<<<< HEAD
import { body, check } from 'express-validator'
import { createUser, loginUser, loginUserPost, logoutUser, signupUser } from "../controller/user.js";
=======
import { body } from 'express-validator'
import { createUser, loginUser, loginUserPost, signupUser } from "../controller/user.js";
>>>>>>> e16239878b8cc0b7e0f37f3aa02c7876eef757df
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
<<<<<<< HEAD
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
=======
        .isLength({min:1})
], createUser);

router.get('/login', loginUser);

router.post('/login', loginUserPost);
>>>>>>> e16239878b8cc0b7e0f37f3aa02c7876eef757df


export default router;