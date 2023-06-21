import express from "express";
import { body } from 'express-validator'
import { createUser, loginUser } from "../controller/user.js";
import User from "../model/user.js";

const router = express.Router();

router.post('/signup',[
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

    body('name')
        .trim()
        .not()
        .isEmpty()
], createUser);

router.post('/login', loginUser);


export default router;