const express = require('express');
const home = express.Router({mergeParams:true});
const {Post} = require('../utils/models/post');
const {User} = require('../utils/models/user');


/*
* This Home Page to retrieve all posts
*
* TODO => (1) you should handle and random it ..
*
* */
home.get('/', async (req, res) => {
    let posts = await Post.find().sort({createdAt: -1});
    res.send(posts)
})


/*
* Push Post to Home page and User Page in the same time..
*   to appear on User Page and Home Page..
* */
home.post(['/','/users/:userId'], async (req, res) => {
    await User.findById(req.params.userId).exec( async (err, user) => {
        if (!user) return res.status(404).send('User is not Found!');
        let newPost = new Post({
            body: req.body.body,
            createdAt: Date.now(),
            comments: req.body.comments,
            authorId: req.params.userId,
        });
        // Push post to (User.posts) List => {'/users/:userId'} route
        user.posts.push(newPost);
        await user.save();

        // Push post to (Home) Page  => {/} route
        newPost = await newPost.save();
        res.send(newPost);
    });
})

home.get('/users/:userId/:postId', async (req, res) => {
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

home.post('/', async (req, res) => {
    let post = new Post({
        body: req.body.body,
        createdAt: Date.now(),
        comments: req.body.comments,
        authorId: req.body.authorId,
    });
    const user = await User.findById(post.authorId);
    if (!user) return res.status(400).send('User is not found!');
    post = await post.save();
    res.send(post);
});


module.exports = home;