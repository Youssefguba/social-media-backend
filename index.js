const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv/config');

// Routes
const userRouter = require('./routes/users');
const postRouter = require('./routes/posts');


mongoose.connect('mongodb://localhost/ameen', { useNewUrlParser: true , useUnifiedTopology: true },
    ()=> {console.log('Hello from DB!')})

app.use(express.json());
app.use(bodyParser.json());


app.use("/users", userRouter);
app.use("/posts", postRouter);


app.listen(4000, ()=> {console.log("Hello from our Listener")});