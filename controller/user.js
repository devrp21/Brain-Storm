import bcrypt from 'bcryptjs';
import { validationResult, check } from 'express-validator';
import jwt from "jsonwebtoken";
import User from "../model/user.js";
import Post from "../model/post.js";


<<<<<<< HEAD
export const signupUser = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }
    res.render("auth/signup", {
        pageTitle: 'Sign Up',
        errorMessage: message,
        oldInput: { email: "", password: "", username: "" },
        isAuth:false
    });
=======
export const signupUser=(req,res,next)=>{
    res.render("auth/signup");
>>>>>>> e16239878b8cc0b7e0f37f3aa02c7876eef757df
}

export const createUser = async (req, res, next) => {
    const errors = validationResult(req);
<<<<<<< HEAD
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }
    const username = req.body.username;
=======
    console.log('hi',errors.errors);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const username = req.body.username;
    // console.log(username);
>>>>>>> e16239878b8cc0b7e0f37f3aa02c7876eef757df
    const email = req.body.email;
    const password = req.body.password;


    if (!errors.isEmpty()) {
        return await res.render("auth/signup", {
            pageTitle: 'Sign Up',
            oldInput: {
                username: username,
                email: email,
<<<<<<< HEAD
                password: password
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            isAuth:false
        });
    }

    try {
        const hashedPw = await bcrypt.hash(password, 12);
        const user = new User({
            email: email,
            password: hashedPw,
            name: username
        });
        await user.save();
        res.status(201).render("auth/login", {
            pageTitle: 'Login',
            errorMessage: message,
            isAuth:false
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
=======
                password: hashedPw,
                name: username
            });
            await user.save();
            res.status(201).send('success');
        } catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
>>>>>>> e16239878b8cc0b7e0f37f3aa02c7876eef757df
        }
        next(err);
    }
};

<<<<<<< HEAD
export const loginUser = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }
    res.render("auth/login", {
        pageTitle: 'Login',
        errorMessage: message,
        oldInput: { email: "", password: "" },
        isAuth:false
    });
}

export const loginUserPost = async (req, res, next) => {
    const errors = validationResult(req);
=======
export const loginUser=(req,res,next)=>{
    res.render("auth/login");
}

export const loginUserPost = async (req, res, next) => {
>>>>>>> e16239878b8cc0b7e0f37f3aa02c7876eef757df
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    if (!errors.isEmpty()) {
        return await res.render("auth/login", {
            pageTitle: 'Login',
            oldInput: {
                email: email,
                password: password
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            isAuth:false
        });
    }

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
<<<<<<< HEAD
            req.flash('error', 'Invalid email or password.');
            return res.status(422).render('auth/login', {
                pageTitle: 'Login',
                errorMessage: 'Invalid email or password.',
                oldInput: { email: email, password: password },
                isAuth:false
            });
=======
            const error = new Error('A sure with this email could not be found.');
            error.statusCode = 401;
            throw error;
>>>>>>> e16239878b8cc0b7e0f37f3aa02c7876eef757df
        }

        const isEqual = await bcrypt.compare(password, user.password);
        
        if (!isEqual) {
            return res.status(422).render('auth/login', {
                pageTitle: 'Login',
                errorMessage: 'Invalid email or password.',
                oldInput: { email: email, password: password },
                isAuth:false
            });
        }
        
        loadedUser = user;
        // req.isAuth = true;

        // req.isAuth = true;

        const token = jwt.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString()
        },
            'secret',
            { expiresIn: '1h' }
        );
<<<<<<< HEAD
        // console.log(token);
        req.session.user = loadedUser;
        req.session.token = token;
        req.session.isLoggedIn=true;
        // res.status(200).send(req.session.user);
        res.redirect('/feed/thoughts');
=======
        res.status(200).send('success');
>>>>>>> e16239878b8cc0b7e0f37f3aa02c7876eef757df
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);

    }
};


export const logoutUser=(req,res,next)=>{
    req.session.isLoggedIn=false;
    req.session.destroy();
    res.redirect('/');
}