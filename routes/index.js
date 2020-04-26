const express = require('express');
const home = express.Router({mergeParams:true});
const {Post, validatePost, Comment} = require('../utils/models/post');
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
* Get Post
* */
home.get('/:postId', async (req, res) => {
    let posts = await Post.findById(req.params.postId);
    res.send(posts)
})

/*
* Get Comment of post
* */
home.get('/:postId/:commentId', async (req, res) => {
     let comment = await Post.findById(req.params.postId).then(post =>
         post.comments.findById(req.params.commentId)
     );
    res.send(comment)
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

// Get Post related to the user..
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

/*
* Update Post
* */
home.put(['/:postId','/users/:userId/:postId'], async (req, res) => {
    const error = validatePost(req.body)
    if (error) return res.status(400).send(error.details[0].message);
    let userPost = await User.findById(req.params.userId).exec((err, user)=> {
        // Find Body of post's user to change it's body.
        user.posts.id(req.params.postId).body = req.body.body;
        user.save();
    })
    let post = await Post.findByIdAndUpdate(req.params.postId, {body: req.body.body}, {new: true});
    if (!post) return res.status(404).send('Post is not found!.');
    if (post.body === "") return res.send(400).send(error.details[0].message);

    res.send(post);
    res.send(userPost);
});



/*
* Delete Post
* */
home.delete(['/:postId','/users/:userId/:postId'], async (req, res) => {
    const error = validatePost(req.body)
    if (error) return res.status(400).send(error.details[0].message);
    let post = await Post.findByIdAndDelete(req.params.postId);
    if (!post) return res.status(404).send('Post is not found!.');

    res.send(post);
});

/*
* Add comment
* */

home.post(['/:postId/:commentId', '/users/:userId/:postId/:commentId'], async (req, res) => {

})



module.exports = home;