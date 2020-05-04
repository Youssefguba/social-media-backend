const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const { User, userSchema } = require("../models/user");

const commentSchema = new mongoose.Schema({
    commentId: mongoose.Schema.Types.ObjectId,
    comment_body: String,
    authorName: String,
    authorPhoto: String,
    createdAt: {type: Date, default: Date.now},
    authorId: { ref:'User', type: mongoose.Schema.Types.ObjectId },
    postId  : { ref:'Post', type: mongoose.Schema.Types.ObjectId }
});


const postSchema = new mongoose.Schema({
    postId: mongoose.Schema.ObjectId,
    body: String, // => "Any Example"
    authorId: mongoose.Types.ObjectId,
    authorName: String,
    authorPhoto: String,
    comments: [commentSchema],
    author: {
        ref: 'User',
        type: mongoose.Schema.ObjectId,
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
             ameen: [{_id: mongoose.Schema.ObjectId, username: String, profile_pic: String}],
             recommended: [{_id: mongoose.Schema.ObjectId, username: String, profile_pic: String}],
             forbidden: [{_id: mongoose.Schema.ObjectId, username: String, profile_pic: String}]
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