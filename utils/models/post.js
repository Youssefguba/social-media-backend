const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const { User, userSchema } = require("../models/user");


const postSchema = new mongoose.Schema({
    post_id: mongoose.Schema.Types.ObjectId,
    body: String, // => "Any Example"
    authorId: mongoose.Types.ObjectId,
    comments: Number, // Numbers of Comments
    author: {
        ref: 'User',
        type: mongoose.Schema.Types.ObjectId
    },
    createdAt: {
        type: Date,
        default: Date.now
    }, // => 12/12/2012 SAT 12:06 AM
    badge:[{ // Badges of the post will appear when any of items > 50.
        isRecommended: Boolean,
        isForbidden: Boolean
    }],
    reactions: [{ // Number of Reactions on post.
        ameen: Number,
        recommended: Number,
        forbidden: Number
    }],
});

function validatePost(post){
    const schema = Joi.object().keys({
        body: Joi.string().required(),
    });
    schema.validate(post)
}

module.exports = {
    Post: mongoose.model('Post', postSchema),
    postSchema: postSchema,
    validate: validatePost
}