import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import jwt from "jsonwebtoken";
import User from "../model/user.js";
import Post from "../model/post.js";

export const createUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const username = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ email: email });
    const uname = await User.findOne({ name: username });

    if (user) {
        res.send('Email Already Exist. Try another email.');
    }
    else if (uname) {
        res.send('Username Already Taken. Try another one');
    }
    else {
        try {
            const hashedPw = await bcrypt.hash(password, 12);
            const user = new User({
                email: email,
                password: hashedPw,
                name: username
            });
            await user.save();
            res.status(201).json({ message: 'User Created!', useerId: user._id })
        } catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }
    }
};

export const loginUser = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error('A suer with this email could not be found.');
            error.statusCode = 401;
            throw error;
        }

        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);


        if (!isEqual) {
            const error = new Error('Wrong Password');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString()
        },
            'secret',
            { expiresIn: '1h' }
        );
        res.status(200).json({ token: token, userId: loadedUser._id.toString() })
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);

    }
};