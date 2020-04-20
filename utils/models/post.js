const mongoose = require('mongoose');


const postSchema = new mongoose.Schema({
    body: String, // => "Any Example"
    author:{
            ref:'User', //Ref for User Id
            type:mongoose.Schema.Types.ObjectId,
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

module.exports.Post = mongoose.model('Post', postSchema);
module.exports.postSchema = postSchema;