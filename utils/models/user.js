const mongoose = require('mongoose');
const {postSchema} = require('../models/post');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
    user_id: mongoose.Schema.Types.ObjectId,
    username: String,         //username
    first_name: String,
    last_name: String,
    email: String,            //email
    password: String,
    birthday: String,         //birthday
    profile_pic: String,      // /public/profile_pic/username/user.png
    followers: Array,         //['Ahmed Mohamed', 'Youssef mohamed']
    following: Array,         //['Ahmed Mohamed', 'Youssef mohamed']
    notification: Array,      //List of Notification of user
    posts: [postSchema],
    isActive: Boolean,        // Status of User Active or !Active
    isAdministrator: {type: Boolean, default: false}, // user isAdministrator or !
    joined_date: {
        type: Date,
        default: Date.now
    },        // Date of User joined on it
    chat_rooms: Array,        // Chats page of User.
});

/* Validation User within response to the server */
function validateUser(post){
    const schema = Joi.object().keys({
        username: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
        isAdmin: Joi.boolean().required()
    });
    schema.validate(post)
}


module.exports = {
    User: mongoose.model('User', userSchema),
    userSchema: userSchema,
    validate: validateUser
}
