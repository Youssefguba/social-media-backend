const express = require('express');
const home = express.Router();
const {Post, validatePost, Comment, Reaction} = require('../utils/models/post');
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

home.get('/favicon.ico', (req, res) => res.status(204).send("No Content"));


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
            authorName: user.username,
            authorPhoto: user.profilePic
        });
        // Push post to (User.posts) List => {'/users/:userId'} route
        user.posts.push(newPost);
        await user.save();

        // Push post to (Home) Page  => {/} route
        newPost = await newPost.save();
        res.send(newPost);
    });
});


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
* Get Post
* */
home.get('/:postId', async (req, res) => {
    let posts = await Post.findById(req.params.postId);
    res.send(posts)
});

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

/* Save Post to Saved List*/
// home.get(['/:postId','/users/:userId/savedPosts'], async (req, res) =>{
//     let savedPost = await Post.findById(req.params.postId);
//     await User.findById(req.params.userId).exec((err, user) => {
//         user.saved_posts.push(savedPost);
//         res.send(savedPost);
//     });
// });

/*
* Add comment
* */
home.post(['/:postId/comments', '/users/:userId/:postId/comments'], async (req, res) => {
    await Post.findById(req.params.postId).exec(async (err, post) => {
        // Create a new comment..
        let newComment = new Comment({
            comment_body: req.body.comment_body,
            authorId: req.params.userId || post.authorId,
            postId: req.params.postId,
            authorName: post.authorName
        });

        if (!post) return res.status(404).send("Post is not Found!");
        //find the post of user to push comment for it for posts collection..
        await post.comments.push(newComment)
        post.save()

        //find the user to push comment for it for User collection..
        await User.findById(req.params.userId || post.authorId).exec(async (err, user) => {
            await user.posts.id(req.params.postId).comments.push(newComment)
            user.save()
        })
        // Save comment for Comment Collection..
        newComment.save()
        res.send(newComment)
    })
})

/*
* Remove a comment
* */
home.delete(['/:postId/comments/:commentId', '/users/:userId/:postId/comments/:commentId'], async (req, res) => {
    await Post.findById(req.params.postId).exec(async (err, post) => {
        if (!post) return res.status(404).send("Post is not Found!")
        // Find comment by Id..
        let comment =  post.comments.id(req.params.commentId);
        //Check if comment is existed or not to remove it
        comment ?  await comment.remove() : res.status(404).send("Comment is not Found!") ;
        post.save();
    })
    await User.findById(req.params.userId).exec(async (err, user) =>{
        if (!user) return res.status(404).send("User is not Found!")
        // Remove comment from User collection.
        let comment =  user.posts.id(req.params.postId).comments.id(req.params.commentId)
        //Check if comment is existed or not to remove it
        comment ? await comment.remove() : res.status(404).send("Comment is not Found!") ;
        comment.remove();
        user.save()
    })
    // Remove comment from Comment collection.
    let comment = await Comment.findByIdAndDelete(req.params.commentId);
    if (!comment) return res.status(404).send("Comment is not Found!");
    res.send(comment);
})

/*
* Get Comment of post
* */
home.get('/:postId/comments/:commentId', async (req, res) => {
    let comment = await Post.findById(req.params.postId).then(post =>
        post.comments.findById(req.params.commentId)
    );
    res.send(comment)
});

/*
* React with Ameen
* */
home.post(['/:postId/reactions', '/users/:userId/:postId/reactions'], async (req, res) => {
    let mainUser = await User.findById(req.params.userId);
    await Post.findById(req.params.postId).exec(async (err, post) => {
        let newReaction = Reaction({
            _id: mainUser.id,
            username: mainUser.username,
            userId: mainUser.id,
            postId: req.params.postId,
        });
            // ** We made this to make changes happen in database when user click on "Ameen" button.. ** //
            // (*) Check if the user is the owner of post or not..

            // (1) If the user is /not/ the owner..
            if (!(mainUser.posts.id(req.params.postId))) {
                await User.findById(post.authorId).exec(async (err, user) => {
                    await user.posts.id(req.params.postId).ameenReaction.push(newReaction);
                    await post.ameenReaction.push(newReaction)
                    await mainUser.save();
                    await post.save();
                    await user.save();
                });
                //.. then find the place of post in User collection to push post to the list..
            } else if ((mainUser.posts.id(req.params.postId))) {
                // (2) If the user is the Owner..
                await mainUser.posts.id(req.params.postId).ameenReaction.push(newReaction);
                await post.ameenReaction.push(newReaction);
                await mainUser.save();
                await post.save();
            }
        res.send(newReaction);
   });
});

/*
* React with Recommend
* */
home.post(['/:postId/reactions', '/users/:userId/:postId/reactions'], async (req, res) => {
    let user_info  = await User.findById(req.params.userId).select("id username");
    let mainUser = await User.findById(req.params.userId);
    await Post.findById(req.params.postId).exec(async (err, post) => {

        if (res.status(200)){
            // ** We made this to make changes happen in database when user click on "Ameen" button.. ** //
            // (*) Check if the user is the owner of post or not..
            // (1) If the user is /not/ the owner..
            if (!(mainUser.posts.id(req.params.postId))) {
                await User.findById(post.authorId).exec(async (err, user) => {
                    await user.posts.id(req.params.postId).recommendReaction.push(user_info);
                    await post.recommendReaction.push(user_info)
                    await mainUser.save();
                    await user_info.save();


                });
                //.. then find the place of post in User collection to push post to the list..
            } else {
                // (2) If the user is the Owner..
                await mainUser.posts.id(req.params.postId).recommendReaction.push(user_info);
                await post.recommendReaction.push(user_info)
                await user_info.save();
                await mainUser.save();
            }
        }

        await post.save();
    });
});

/*
* React with Forbidden
* */
home.post(['/:postId/reactions', '/users/:userId/:postId/reactions'], async (req, res) => {
    let user_info  = await User.findById(req.params.userId).select("id username");
    let mainUser = await User.findById(req.params.userId);
    await Post.findById(req.params.postId).exec(async (err, post) => {
        /*
         * We made this to make changes happen in database when user click on "Ameen" button..
         * */
        // (*) Check if the user is the owner of post or not..
        // (1) If the user is /not/ the owner..
        if (!(mainUser.posts.id(req.params.postId))) {
            await User.findById(post.authorId).exec(async (err, user) => {
                await user.posts.id(req.params.postId).forbiddenReaction.push(user_info);
                await post.forbiddenReaction.push(user_info)
                await mainUser.save();
                await user_info.save();


            });
            //.. then find the place of post in User collection to push post to the list..
        } else {
            // (2) If the user is the Owner..
            await mainUser.posts.id(req.params.postId).forbiddenReaction.push(user_info);
            await post.forbiddenReaction.push(user_info)
            await user_info.save();
            await mainUser.save();
        }
        await post.save();
    });
});

/*
* Get Ameen Reaction
* */
home.get(['/:postId/reactions/:reactionId', '/users/:userId/:postId/reactions/:reactionId'], async (req, res) => {
    let post =  await Post.findById(req.params.postId);
    let reaction = await post.ameenReaction.id(req.params.reactionId);
    res.send(reaction);
});

/*
* Delete Ameen Reaction
* */
home.delete(['/:postId/reactions/:reactionId', '/users/:userId/:postId/reactions/:reactionId'], async (req, res) =>{
    let mainUser   = await User.findById(req.params.userId);
    // TODO (1) => Check if the user liked this post or not!
    /*
    * We made this to make changes happen in database when user click on "Ameen" button..
    * */
    // (*) Check if the user is the owner of post or not..
    // (1) If the user is /not/ the owner..
    await Post.findById(req.params.postId).exec(async (err, post) => {
        //TODO remove the reaction of the user that liked the post ..
        if (!(mainUser.posts.id(req.params.postId))) {
            // .. then find the place of post in User collection to push post to the list..
            await User.findById(post.authorId).exec(async (err, user) => {
                let userPostReaction = await user.posts.id(req.params.postId).ameenReaction.id(req.params.reactionId);
                await userPostReaction.remove();
                await user.save();
                await mainUser.save();
                await post.save();
            });
            let postReaction = await post.ameenReaction.id(req.params.reactionId);
            await postReaction.remove();
            await mainUser.save();
            await post.save();

        } else if (mainUser.posts.id(req.params.postId)) {
            // (2) If the user is the Owner..
            await User.findById(req.params.userId).exec(async (err, user) => {
                let userPostReaction = await user.posts.id(req.params.postId).ameenReaction.id(req.params.reactionId);
                let postReaction = await post.ameenReaction.id(req.params.reactionId);
                await postReaction.remove();
                await userPostReaction.remove();
                await post.save();
                await user.save();
            });
        }
        res.send(post);
    });
});


module.exports = home;
