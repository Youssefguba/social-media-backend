const mongoose = require('mongoose');
const {postSchema} = require('../models/post');

//
// const postSchema = new mongoose.Schema({
//     body: String, // => "Any Example"
//     author:{
//         ref:'User', //Ref for User Id
//         type:mongoose.Schema.Types.ObjectId,
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }, // => 12/12/2012 SAT 12:06 AM
//     badge:[{ // Badges of the post will appear when any of items > 50.
//         isRecommended: Boolean,
//         isForbidden: Boolean
//     }],
//     reactions: [{ // Number of Reactions on post.
//         ameen: Number,
//         recommended: Number,
//         forbidden: Number
//     }],
//     comments: Number, // Numbers of Comments
// });

const userSchema = new mongoose.Schema({
    username: String,         //username
    email: String,            //email
    birthday: String,         //birthday
    profile_pic: String,      // /public/profile_pic/username/user.png
    followers: Array,         //['Ahmed Mohamed', 'Youssef mohamed']
    following: Array,         //['Ahmed Mohamed', 'Youssef mohamed']
    notification: Array,      //List of Notification of user
    posts: [postSchema],
    isActive: Boolean,        // Status of User Active or !Active
    isAdministrator: Boolean, // user isAdministrator or !
    joined_date: {
        type: Date,
        default: Date.now
    },        // Date of User joined on it
    chat_rooms: Array,        // Chats page of User.
});

//
//
// module.exports.Post = mongoose.model('Post', postSchema);
// module.exports.postSchema = postSchema;

module.exports.User  = mongoose.model('User', userSchema);
module.exports.userSchema  = userSchema;
