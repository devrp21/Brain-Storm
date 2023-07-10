import bcrypt from 'bcryptjs';
import { validationResult, check } from 'express-validator';
import jwt from "jsonwebtoken";
import User from "../model/user.js";
import Post from "../model/post.js";


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
        isAuth: false
    });
}

export const createUser = async (req, res, next) => {
    const errors = validationResult(req);
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;


    if (!errors.isEmpty()) {
        return await res.render("auth/signup", {
            pageTitle: 'Sign Up',
            oldInput: {
                username: username,
                email: email,
                password: password
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            isAuth: false
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
            isAuth: false
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

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
        isAuth: false
    });
}

export const loginUserPost = async (req, res, next) => {
    const errors = validationResult(req);
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
            isAuth: false
        });
    }

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            req.flash('error', 'Invalid email or password.');
            return res.status(422).render('auth/login', {
                pageTitle: 'Login',
                errorMessage: 'Invalid email or password.',
                oldInput: { email: email, password: password },
                isAuth: false
            });
        }

        const isEqual = await bcrypt.compare(password, user.password);

        if (!isEqual) {
            return res.status(422).render('auth/login', {
                pageTitle: 'Login',
                errorMessage: 'Invalid email or password.',
                oldInput: { email: email, password: password },
                isAuth: false
            });
        }

        loadedUser = user;
        // req.isAuth = true;

        const token = jwt.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString()
        },
            'secret',
            { expiresIn: '1h' }
        );
        // console.log(token);
        req.session.user = loadedUser;
        req.session.token = token;
        req.session.isLoggedIn = true;
        // res.status(200).send(req.session.user);
        res.redirect('/feed/thoughts');
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);

    }
};


export const logoutUser = (req, res, next) => {
    // Clear session data and set isLoggedIn flag to false
    req.session.isLoggedIn = false;
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      }
      
      // Clear client-side tokens or session data (e.g., JWT token)
      res.clearCookie('token'); // Assuming you store the token in a cookie called 'token'
      
      // Set appropriate headers to prevent caching
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Redirect to the login page with a random query parameter
      return res.redirect('/auth/login');
    });
  };

