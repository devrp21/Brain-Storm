import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import feedRoutes from './routes/feed.js';
import userRoutes from './routes/user.js';


const app = express();

app.use(bodyParser.json());

app.use('/feed',feedRoutes);
app.use('/auth',userRoutes);


mongoose.connect('mongodb+srv://devrpatel2106:DeV5470@cluster0.rqrchwt.mongodb.net/brainstorm')
    .then(result => {
        const server = app.listen(8080);
        if(server){
            console.log('Server Run at 8080');
        }
        else{
            console.log('Error');
        }
    })
    .catch(err => console.log(err));