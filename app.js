import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import feedRoutes from './routes/feed.js';
import userRoutes from './routes/user.js';
import path from 'path';
import session from 'express-session';
import flash from 'connect-flash';
import { fileURLToPath } from 'url';
import User from './model/user.js';
import { getHome } from './controller/feed.js';



const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicPath = path.join(__dirname, "./public");
const viewsPath = path.join(__dirname, "./views");

app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", viewsPath);

app.use(express.static(publicPath));

app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
}));

app.use(flash());

app.use(async (req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    try {
        const user = await User.findById(req.session.user._id);
        if (!user) {
            return next();
        }
        req.user = user;
        next();
    }
    catch (err) {
        console.log(err);
    }
});

app.use('/feed', feedRoutes);
app.use('/auth', userRoutes);
app.get('/',getHome);


// app.use((error, req, res, next) => {
//     console.log(error);
//     const status = error.statusCode;
//     const message = error.message;
//     const data = error.data;
//     res.status().json({ message: message, data: data });
// });


mongoose.connect('mongodb+srv://devrpatel2106:DeV5470@cluster0.rqrchwt.mongodb.net/brainstorm')
    .then(result => {
        const server = app.listen(8080);
        if (server) {
            console.log('Server Run at 8080');
        }
        else {
            console.log('Error');
        }
    })
    .catch(err => console.log(err));