const express = require('express');
const router = express.Router();
const app = express.Router();
const {Post, validate}  = require('../utils/models/post')

/*  GET Posts Listing */
router.get('/', async (req, res) => {
    const post = await Post.find();
    res.send(post);
});

router.get('/:postId', async (req, res) => {
    let post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).send('Post is not found!.');

    res.send(post);
});

router.post('/', async (req, res) => {
    let post = new Post({
        body: req.body.body,
        createdAt: Date.now(),
        comments: req.body.comments,
    });
    post = await post.save();
    res.send(post);
});



router.put('/:postId', async (req, res) => {
    const {error} = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message);
    let post = await Post.findOneAndUpdate(req.params.postId, {body: req.body.body}, {new: true});
    if (!post) return res.status(404).send('User is not found!.');

    res.send(post);
});

module.exports = router;