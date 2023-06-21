import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import feedRoutes from './routes/feed.js';
import userRoutes from './routes/user.js';


const app = express();

app.use(bodyParser.json());

app.use('/feed', feedRoutes);
app.use('/auth', userRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});


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