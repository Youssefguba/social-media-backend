const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv/config');

// Routes
const userRouter = require('./routes/users');
const postRouter = require('./routes/posts');

mongoose.connect(require('../../config/app').db.connectionUri, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));


app.use(express.json());
app.use(bodyParser.json());


app.use("/users", userRouter);
app.use(`/posts`, postRouter);


app.listen(4000, ()=> {console.log("Hello from our Listener")});