import express from "express";
import { body } from 'express-validator'
import { createUser, loginUser, loginUserPost, signupUser } from "../controller/user.js";
import User from "../model/user.js";

const router = express.Router();

router.get('/signup', signupUser);

router.post('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please Enter a valid email.')
        .custom(async (value, { req }) => {
            return User.findOne({ email: value }).then(userDoc => {
                if (userDoc) {
                    return Promise.reject('Email Address already exists!');
                }
            });
        })
        .normalizeEmail(),

    body('password')
        .trim()
        .isLength({ min: 5 }),

    body('username')
        .trim()
        .not()
        .isEmpty()
        .isLength({min:1})
], createUser);

router.get('/login', loginUser);

router.post('/login', loginUserPost);


export default router;