const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const { User, userSchema } = require("../models/user");

const reactionsSchema = new mongoose.Schema({
    reactionId: mongoose.Schema.Types.ObjectId,
    username: String,
    user_Id: mongoose.Schema.Types.ObjectId,
    profilePic: String,
    postId: mongoose.Schema.Types.ObjectId,
});

const commentSchema = new mongoose.Schema({
    commentId: mongoose.Schema.Types.ObjectId,
    comment_body: String,
    authorName: String,
    authorPhoto: String,
    createdAt: {type: Date, default: Date.now},
    authorId: { ref:'User', type: mongoose.Schema.Types.ObjectId},
});


const postSchema = new mongoose.Schema({
    postId: mongoose.Schema.Types.ObjectId,
    body: String, // => "Any Example"
    authorId: mongoose.Schema.Types.ObjectId,
    authorName: String,
    authorPhoto: String,
    comments: [commentSchema],
    author: {
        ref: 'User',
        type: mongoose.Schema.Types.ObjectId,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }, // => 12/12/2012 SAT 12:06 AM
    badge:[{ // Badges of the post will appear when any of items > 50.
        isRecommended: Boolean,
        isForbidden: Boolean
    }],
     // Number of Reactions on post.
    ameenReaction:     [reactionsSchema],
    recommendReaction: [reactionsSchema],
    forbiddenReaction: [reactionsSchema]
    
});



function validatePost(post){
    const schema = Joi.object().keys({
        body: Joi.string().required(),
    });
    schema.validate(post)
}

module.exports = {
    Post: mongoose.model('Post', postSchema),
    Comment: mongoose.model('Comment', commentSchema),
    Reaction: mongoose.model('Reaction', reactionsSchema),
    postSchema: postSchema,
    commentSchema: commentSchema,
    validatePost: validatePost
}