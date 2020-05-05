const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const { User, userSchema } = require("../models/user");

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
    reactions: { // Number of Reactions on post.
        ameen:       [{ameenId: mongoose.Schema.Types.ObjectId,       username: String, profilePic: String}],
        recommended: [{recommendedId: mongoose.Schema.Types.ObjectId, username: String, profilePic: String}],
        forbidden:   [{forbiddenId: mongoose.Schema.Types.ObjectId,   username: String, profilePic: String}]
      },
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
    postSchema: postSchema,
    commentSchema: commentSchema,
    validatePost: validatePost
}