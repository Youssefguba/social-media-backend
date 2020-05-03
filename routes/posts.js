const express = require('express');
const post = express.Router({mergeParams:true});
const {Post, validatePost}  = require('../utils/models/post')
const {User, postsRouter}  = require('../utils/models/user')


/*  GET Posts Listing */
// post.get('/', async (req, res) => {
//     const post = await Post.find();
//     res.send(post);
// });


// post.put('/:postId', async (req, res) => {
//     const {error} = validate(req.body)
//     if (error) return res.status(400).send(error.details[0].message);
//     let post = await Post.findOneAndUpdate(req.params.postId, {body: req.body.body}, {new: true});
//     if (!post) return res.status(404).send('User is not found!.');
//
//     res.send(post);
// });

module.exports = post;