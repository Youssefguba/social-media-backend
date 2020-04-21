const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const { User } = require("../models/user");


const postSchema = new mongoose.Schema({
    post_id: mongoose.Schema.Types.ObjectId,
    body: String, // => "Any Example"
    author_Id:  String,
    author: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        field:'authorId' // use this field to get object id
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
    comments: Number, // Numbers of Comments
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