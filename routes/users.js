const express = require('express');
const user = express.Router();
const {User, validateUser}  = require('../utils/models/user')
const {Post}  = require('../utils/models/post')

/*  GET Users List */
user.get('/', async (req, res) => {
    const user = await User.find();
    res.send(user);
});

// Get a specific user with his info.
user.get('/:userId', async (req, res) => {
   let user = await User.findById(req.params.userId)
       .select('username email posts');
   if (!user) return res.status(404).send('User is not found!.');
   res.send(user);
});

// Create a New User..
user.post('/', async (req, res) => {
    const  error  = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = new User({
        username: req.body.username,
        email:req.body.email,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        birthday: req.body.birthday,
        profile_pic: "PUT Here default photo",
        followers: [],
        following: [],
        notification: [],
        posts: [],
        isActive: req.body.isActive
    });
    user = await user.save();
    res.send(user);
});

/*
* Get list of user followers.
* */
user.get('/:userId/followers', async (req, res) => {
    let user = await User.findById(req.params.userId).select('followers');
    if (!user) return res.status(404).send('User is not found!.');
    res.send(user);

})

/*
* Get list of user following.
* */
user.get('/:userId/following', async (req, res) => {
    let user = await User.findById(req.params.userId).select('following');
    if (!user) return res.status(404).send('User is not found!.');
    res.send(user);
})

/*
* Get list of user saved post.
* */
user.get('/:userId/saved', async (req, res) => {
    let user = await User.findById(req.params.userId).select('saved_posts');
    if (!user) return res.status(404).send('User is not found!.');
    res.send(user);
})


module.exports = user;