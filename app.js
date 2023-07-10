import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.js';
import feedRoutes from './routes/feed.js';
import userRoutes from './routes/user.js';
import path from 'path';
import session from 'express-session';
import flash from 'connect-flash';
import { fileURLToPath } from 'url';
import User from './model/user.js';
import { getHome } from './controller/feed.js';
import multer from 'multer';
import methodOverride from 'method-override';
import checkAndUpdateData from './utils/dataConsistency.js';
import { get404,get500 } from './controller/error.js';



const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicPath = path.join(__dirname, "./public");
const viewsPath = path.join(__dirname, "./views");

app.use(bodyParser.urlencoded({ extended: false }));

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, Math.random().toFixed(10) + '-' + file.originalname)
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", viewsPath);

app.use(function (req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

app.use(express.static(publicPath));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use('/user/images', express.static(path.join(__dirname, 'images')));
app.use('/feed/images', express.static(path.join(__dirname, 'images')));

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

app.use(methodOverride('_method'));

app.get('/', getHome);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/feed', feedRoutes);

// app.get('/500',get500);
app.use(get404);

app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).render('500', {
    pageTitle: 'Error',
    path: '/500',
    isAuth: req.session.isLoggedIn
  });
});


mongoose.connect('mongodb+srv://devrpatel2106:DeV5470@cluster0.rqrchwt.mongodb.net/brainstorm')
  .then(result => {
    checkAndUpdateData()
      .then(() => {
        console.log('Data consistency check completed');
        // Start the server
        const server = app.listen(8080);
        if (server) {
          console.log('Server Run at 8080');
        }
        else {
          console.log('Error');
        }
      })
  })
  .catch(err => console.log(err));