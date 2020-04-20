const express = require('express');
const app = express();
const router = express.Router();
const Post  = require('../utils/models/post')

/*  GET Posts Listing */
router.get('/', async (req, res) => {
    const post = await Post.find();
    res.send(post);
});

router.get('/:id', async (req, res) => {
    let post = await Post.findById(req.params.id)
        .select('body');
    if (!post) return res.status(404).send('Post is not found!.');

    res.send(post);
});


router.post('/', async (req, res) => {
    let post = new Post({
        body: req.body.body,
        createdAt: Date.now()
    });

    post = await post.save();
    res.send(post);
});

module.exports = router;