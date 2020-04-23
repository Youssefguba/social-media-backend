const express = require('express');
const user = express.Router();
const {User, validate}  = require('../utils/models/user')
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
    const  error  = validate(req.body);
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

// Get a post that related to user.
user.get('/:userId/:postId', async (req, res) => {
    await User.findById(req.params.userId).exec(async (err, user) => {
        if (user) {
            await Post.findById(req.params.postId).exec(async (err, post)=>{
                // Check if Post is existed or not!
                !post ? res.status(404).send('Post is not found!') : res.send(post)
            })
        } else {
            res.status(404).send('User is not Found!')
            console.log(user);
        }
    });
})

module.exports = user;