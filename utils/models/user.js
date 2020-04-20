const mongoose = require('mongoose');
const {postSchema} = require('../models/post');


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

module.exports.User  = mongoose.model('User', userSchema);
module.exports.userSchema  = userSchema;
