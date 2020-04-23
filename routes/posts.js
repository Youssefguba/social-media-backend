const express = require('express');
const post = express.Router({mergeParams:true});
const {Post, validate}  = require('../utils/models/post')
const {User, postsRouter}  = require('../utils/models/user')


/*  GET Posts Listing */
post.get('/', async (req, res) => {
    const post = await Post.find();
    res.send(post);
});

// post.get('/:postId', async (req, res) => {
//     let post = await Post.findById(req.params.postId);
//     if (!post) return res.status(404).send('Post is not found!.');
//
//     res.send(post);
// });

// post.post('/', async (req, res) => {
//     let post = new Post({
//         body: req.body.body,
//         createdAt: Date.now(),
//         comments: req.body.comments,
//         authorId: req.params.userId,
//     });
//     post = await post.save();
//     User.findById(req.body.authorId).exec((err, user) => {
//         user.posts.push(post)
//     });
//     res.send(post);
// });
//


post.put('/:postId', async (req, res) => {
    const {error} = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message);
    let post = await Post.findOneAndUpdate(req.params.postId, {body: req.body.body}, {new: true});
    if (!post) return res.status(404).send('User is not found!.');

    res.send(post);
});

module.exports = post;