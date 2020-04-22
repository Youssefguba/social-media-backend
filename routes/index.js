const express = require('express');
const router = express.Router();
const {Post} = require('../utils/models/post')
const {User} = require('../utils/models/user')

/*
* This Home Page to retrieve all posts
* TODO => (1) you should handle it and random it ..
* */
router.get('/', async (req, res) => {
    let posts = await Post.find().sort({createdAt: -1});
    res.send(posts)
})

router.get('/users/:id/:postId', async (req, res, next) => {
    let user = await User.findById(req.params.id)
})

module.exports = router;