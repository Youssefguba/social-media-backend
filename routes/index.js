const express = require('express');
const router = express.Router();
const {Post} = require('../utils/models/post')

/*
* This Home Page to retrieve all posts
* TODO => (1) you should handle it and random it ..
* */
router.get('/', async (req, res) => {
    let posts = await Post.find().sort({createdAt: -1});
    res.send(posts)
})


module.exports = router;